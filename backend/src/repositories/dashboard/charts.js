const { Pesquisa, Resposta, Client, Cupom, Pergunta } = require('../../../models');
const { Pesquisa, Resposta, Client, Cupom, Pergunta } = require('../../../models');
const { zonedTimeToUtc, utcToZonedTime, format: formatTz } = require('date-fns-tz');
const { Sequelize, Op } = require('sequelize');
const { subDays, differenceInDays, eachDayOfInterval, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');

const timeZone = 'America/Sao_Paulo';

const { fn, col, literal } = Sequelize;

const dateTruncTz = (p, column) => {
    const quotedColumn = column.split('.').map(part => `"${part}"`).join('.');
    return fn('date_trunc', p, literal(`${quotedColumn} AT TIME ZONE 'UTC' AT TIME ZONE '${timeZone}'`));
};

const buildDateFilter = (startDate, endDate) => {
    const filter = {};
    if (startDate) {
        filter[Op.gte] = startDate;
    }
    if (endDate) {
        filter[Op.lte] = endDate;
    }
    return filter;
};

const getResponseChart = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId } : {};
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }

    // Se não houver datas, define o padrão dos últimos 7 dias no fuso horário correto.
    const end = endDate ? endDate : zonedTimeToUtc(new Date(), timeZone);
    const start = startDate ? startDate : subDays(end, 6);

    const diffDays = differenceInDays(end, start);

    let period = 'day';
    if (diffDays > 90) {
        period = 'month';
    } else if (diffDays > 31) {
        period = 'week';
    }

    whereClause.createdAt = buildDateFilter(start, end);

    const responsesByPeriod = await Resposta.findAll({
        where: whereClause,
        attributes: [
            [dateTruncTz(period, 'createdAt'), 'period'],
            [fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'count']
        ],
        group: [dateTruncTz(period, 'createdAt')],
        order: [[dateTruncTz(period, 'createdAt'), 'ASC']]
    });

    const dataMap = new Map(responsesByPeriod.map(item => {
        // Converte a data do banco (que está em UTC, mas representa o início do período em SP) para o fuso de SP
        const zonedPeriod = utcToZonedTime(item.dataValues.period, timeZone);
        // Formata para uma chave consistente 'yyyy-MM-dd'
        const key = format(zonedPeriod, 'yyyy-MM-dd');
        return [key, parseInt(item.dataValues.count)];
    }));

    const interval = {
        start: utcToZonedTime(start, timeZone),
        end: utcToZonedTime(end, timeZone)
    };

    let intervalDays;
    if (period === 'day') {
        intervalDays = eachDayOfInterval(interval);
    } else if (period === 'week') {
        intervalDays = eachDayOfInterval({
            start: startOfWeek(interval.start),
            end: endOfWeek(interval.end)
        }, { step: 7 });
    } else { // month
        intervalDays = eachDayOfInterval({
            start: startOfMonth(interval.start),
            end: endOfMonth(interval.end)
        }, { step: 30 }); // Aproximação, a lógica de formatação cuidará do mês correto
    }


    const chartData = intervalDays.map(day => {
        let name;
        let key;
        let count = 0;

        if (period === 'day') {
            name = format(day, 'dd/MM');
            key = format(day, 'yyyy-MM-dd');
            count = dataMap.get(key) || 0;
        } else if (period === 'week') {
            const weekStart = startOfWeek(day);
            const weekEnd = endOfWeek(day);
            name = `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`;
            
            // Para semanas, precisamos encontrar a chave correspondente no mapa, que é o início da semana
            key = format(weekStart, 'yyyy-MM-dd');
            count = dataMap.get(key) || 0;

        } else { // month
            name = format(day, 'MMMM/yy', { locale: require('date-fns/locale/pt-BR') });
            const monthStartKey = format(startOfMonth(day), 'yyyy-MM-dd');
            count = dataMap.get(monthStartKey) || 0;
        }

        return {
            name,
            Respostas: count,
        };
    });

    // Lógica para agrupar semanas e meses, se necessário, para evitar duplicatas
    if (period === 'week') {
        const weeklyData = {};
        chartData.forEach(item => {
            if (!weeklyData[item.name]) {
                weeklyData[item.name] = item;
            }
        });
        return Object.values(weeklyData);
    }
    
    if (period === 'month') {
        const monthlyData = {};
        chartData.forEach(item => {
            if (!monthlyData[item.name]) {
                monthlyData[item.name] = item;
            }
        });
        return Object.values(monthlyData);
    }

    return chartData;
};

const getConversionChart = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId } : {};
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }
    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;

    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const totalResponses = await Resposta.count({ 
        where: whereClause, 
        distinct: true,
        col: 'respondentSessionId' 
    });
    const totalUsers = await Client.count({ where: whereClause });
    const couponsGenerated = await Cupom.count({ where: whereClause });

    const couponsUsedWhere = { status: 'used' };
    if (tenantId) couponsUsedWhere.tenantId = tenantId;
    if (dateFilter) {
        couponsUsedWhere.updatedAt = dateFilter;
    }
    const couponsUsed = await Cupom.count({ where: couponsUsedWhere });

    return [
        { name: 'Respostas', value: totalResponses },
        { name: 'Cadastros', value: totalUsers },
        { name: 'Cupons Gerados', value: couponsGenerated },
        { name: 'Cupons Utilizados', value: couponsUsed },
    ];
};

const getNpsTrendData = async (tenantId = null, period = 'day', startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId, ratingValue: { [Op.ne]: null } } : { ratingValue: { [Op.ne]: null } };
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }

    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;

    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const trendData = await Resposta.findAll({
        where: whereClause,
        include: [{
            model: Pergunta,
            as: 'pergunta',
            attributes: [],
            where: {
                type: 'rating_0_10'
            },
            required: true
        }],
        attributes: [
            [dateTruncTz(period, 'Resposta.createdAt'), 'period'],
            [fn('SUM', literal('CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END')), 'promoters'],
            [fn('SUM', literal('CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END')), 'detractors'],
            [fn('COUNT', col('Resposta.id')), 'total']
        ],
        group: [dateTruncTz(period, 'Resposta.createdAt')],
        order: [[dateTruncTz(period, 'Resposta.createdAt'), 'ASC']]
    });

    return trendData.map(item => {
        const data = item.dataValues;
        const promoters = parseInt(data.promoters) || 0;
        const detractors = parseInt(data.detractors) || 0;
        const total = parseInt(data.total) || 0;
        let nps = 0;
        if (total > 0) {
            nps = ((promoters / total) * 100) - ((detractors / total) * 100);
        }
        return {
            period: new Date(data.period).toLocaleDateString('pt-BR', { timeZone }),
            nps: parseFloat(nps.toFixed(1)),
        };
    });
};

const getCsatTrendData = async (tenantId = null, period = 'day', startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId, ratingValue: { [Op.ne]: null } } : { ratingValue: { [Op.ne]: null } };
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }

    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;

    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const trendData = await Resposta.findAll({
        where: whereClause,
        include: [{
            model: Pergunta,
            as: 'pergunta',
            attributes: [],
            where: {
                type: 'rating_1_5'
            },
            required: true
        }],
        attributes: [
            [dateTruncTz(period, 'Resposta.createdAt'), 'period'],
            [fn('SUM', literal('CASE WHEN "ratingValue" >= 4 THEN 1 ELSE 0 END')), 'satisfied'],
            [fn('COUNT', col('Resposta.id')), 'total']
        ],
        group: [dateTruncTz(period, 'Resposta.createdAt')],
        order: [[dateTruncTz(period, 'Resposta.createdAt'), 'ASC']]
    });

    return trendData.map(item => {
        const data = item.dataValues;
        const satisfied = parseInt(data.satisfied) || 0;
        const total = parseInt(data.total) || 0;
        let satisfactionRate = 0;
        if (total > 0) {
            satisfactionRate = (satisfied / total) * 100;
        }
        return {
            period: new Date(data.period).toLocaleDateString('pt-BR', { timeZone }),
            satisfaction: parseFloat(satisfactionRate.toFixed(1)),
        };
    });
};

const getResponseCountTrendData = async (tenantId = null, period = 'day', startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId } : {};
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }

    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;

    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const trendData = await Resposta.findAll({
        where: whereClause,
        attributes: [
            [dateTruncTz(period, 'createdAt'), 'period'],
            [fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'count']
        ],
        group: [dateTruncTz(period, 'createdAt')],
        order: [[dateTruncTz(period, 'createdAt'), 'ASC']]
    });

    return trendData.map(item => ({
        period: new Date(item.dataValues.period).toLocaleDateString('pt-BR', { timeZone }),
        responses: parseInt(item.dataValues.count),
    }));
};

const getRegistrationTrendData = async (tenantId = null, period = 'day', startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId } : {};
    // surveyId is not directly applicable to Client model, so we might need a more complex query if we want to filter by survey
    
    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;

    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const trendData = await Client.findAll({
        where: whereClause,
        attributes: [
            [dateTruncTz(period, 'createdAt'), 'period'],
            [fn('COUNT', col('id')), 'count']
        ],
        group: [dateTruncTz(period, 'createdAt')],
        order: [[dateTruncTz(period, 'createdAt'), 'ASC']]
    });

    return trendData.map(item => ({
        period: new Date(item.dataValues.period).toLocaleDateString('pt-BR', { timeZone }),
        registrations: parseInt(item.dataValues.count),
    }));
};

const getEvolutionDashboard = async function (tenantId = null, period = 'day', startDate = null, endDate = null) {
    const npsTrend = await getNpsTrendData(tenantId, period, startDate, endDate);
    const csatTrend = await getCsatTrendData(tenantId, period, startDate, endDate);
    const responseCountTrend = await getResponseCountTrendData(tenantId, period, startDate, endDate);
    const registrationTrend = await getRegistrationTrendData(tenantId, period, startDate, endDate);

    // Combine data into a single structure
    const evolutionData = {};

    const processTrend = (trend, key) => {
        trend.forEach(item => {
            if (!evolutionData[item.period]) {
                evolutionData[item.period] = { period: item.period };
            }
            evolutionData[item.period][key] = item[key];
        });
    };

    processTrend(npsTrend, 'nps');
    processTrend(csatTrend, 'satisfaction');
    processTrend(responseCountTrend, 'responses');
    processTrend(registrationTrend, 'registrations');

    return Object.values(evolutionData).sort((a, b) => new Date(a.period.split('/').reverse().join('-')) - new Date(b.period.split('/').reverse().join('-')));
};

module.exports = {
    getResponseChart,
    getConversionChart,
    getNpsTrendData,
    getCsatTrendData,
    getResponseCountTrendData,
    getRegistrationTrendData,
    getEvolutionDashboard,
};
