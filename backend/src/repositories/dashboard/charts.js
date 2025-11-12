const { Pesquisa, Resposta, Client, Cupom, Pergunta } = require('../../../models');
const { Sequelize, Op } = require('sequelize');

const { fn, col, literal } = Sequelize;

const buildDateFilter = (startDate, endDate) => {
    const filter = {};
    if (startDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        filter[Op.gte] = startOfDay;
    }
    if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        filter[Op.lte] = endOfDay;
    }
    return filter;
};

const getResponseChart = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId } : {};
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }

    let start, end;
    // Default to last 7 days if no dates are provided
    if (!startDate || !endDate) {
        end = new Date();
        start = new Date();
        start.setDate(end.getDate() - 6);
    } else {
        start = new Date(startDate);
        end = new Date(endDate);
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
            [fn('date_trunc', period, col('Resposta.createdAt')), 'period'],
            [fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'count']
        ],
        group: [fn('date_trunc', period, col('Resposta.createdAt'))],
        order: [[fn('date_trunc', period, col('Resposta.createdAt')), 'ASC']]
    });

    const chartData = [];
    const dataMap = new Map(responsesByPeriod.map(item => [
        new Date(item.dataValues.period).toISOString().split('T')[0],
        parseInt(item.dataValues.count)
    ]));

    let currentDate = new Date(start);
    while (currentDate <= end) {
        const formattedDate = currentDate.toISOString().split('T')[0];
        let name;
        
        if (period === 'day') {
            name = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            chartData.push({
                name,
                Respostas: dataMap.get(formattedDate) || 0,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (period === 'week') {
            const weekStart = new Date(currentDate);
            const weekEnd = new Date(currentDate);
            weekEnd.setDate(weekEnd.getDate() + 6);
            name = `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
            
            // Find the truncated week start date from the map
            const weekStartDateInDB = [...dataMap.keys()].find(key => {
                const dbDate = new Date(key);
                return dbDate >= weekStart && dbDate <= weekEnd;
            });

            chartData.push({
                name,
                Respostas: dataMap.get(weekStartDateInDB) || 0,
            });
            currentDate.setDate(currentDate.getDate() + 7);
        } else { // month
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            name = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            
            const monthStartDateInDB = [...dataMap.keys()].find(key => {
                const dbDate = new Date(key);
                return dbDate.getFullYear() === monthStart.getFullYear() && dbDate.getMonth() === monthStart.getMonth();
            });

            chartData.push({
                name,
                Respostas: dataMap.get(monthStartDateInDB) || 0,
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
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
            [fn('date_trunc', period, col('Resposta.createdAt')), 'period'],
            [fn('SUM', literal('CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END')), 'promoters'],
            [fn('SUM', literal('CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END')), 'detractors'],
            [fn('COUNT', col('Resposta.id')), 'total']
        ],
        group: [fn('date_trunc', period, col('Resposta.createdAt'))],
        order: [[fn('date_trunc', period, col('Resposta.createdAt')), 'ASC']]
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
            period: new Date(data.period).toLocaleDateString('pt-BR'),
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
            [fn('date_trunc', period, col('Resposta.createdAt')), 'period'],
            [fn('SUM', literal('CASE WHEN "ratingValue" >= 4 THEN 1 ELSE 0 END')), 'satisfied'],
            [fn('COUNT', col('Resposta.id')), 'total']
        ],
        group: [fn('date_trunc', period, col('Resposta.createdAt'))],
        order: [[fn('date_trunc', period, col('Resposta.createdAt')), 'ASC']]
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
            period: new Date(data.period).toLocaleDateString('pt-BR'),
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
            [fn('date_trunc', period, col('Resposta.createdAt')), 'period'],
            [fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'count']
        ],
        group: [fn('date_trunc', period, col('Resposta.createdAt'))],
        order: [[fn('date_trunc', period, col('Resposta.createdAt')), 'ASC']]
    });

    return trendData.map(item => ({
        period: new Date(item.dataValues.period).toLocaleDateString('pt-BR'),
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
            [fn('date_trunc', period, col('createdAt')), 'period'],
            [fn('COUNT', col('id')), 'count']
        ],
        group: [fn('date_trunc', period, col('createdAt'))],
        order: [[fn('date_trunc', period, col('createdAt')), 'ASC']]
    });

    return trendData.map(item => ({
        period: new Date(item.dataValues.period).toLocaleDateString('pt-BR'),
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