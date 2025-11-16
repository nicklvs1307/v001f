const { Pesquisa, Resposta, Client, Cupom, Pergunta } = require('../../../models');
const { fromZonedTime, toZonedTime, format: formatTz } = require('date-fns-tz');
const { Sequelize, Op } = require('sequelize');
const { subDays, differenceInDays, eachDayOfInterval, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');
const ptBR = require('date-fns/locale/pt-BR');

const timeZone = 'America/Sao_Paulo';

const { fn, col, literal } = Sequelize;

// Formata a data diretamente no PostgreSQL para evitar problemas de fuso horário no JS
const formatDateTz = (period, column) => {
    const quotedColumn = `"${column}"`;
    const zonedColumn = `(${quotedColumn} AT TIME ZONE 'UTC' AT TIME ZONE '${timeZone}')`;
    return fn('TO_CHAR', literal(zonedColumn), period === 'day' ? 'DD/MM/YYYY' : 'YYYY-MM');
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

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : subDays(end, 6);

    whereClause.createdAt = {
        [Op.gte]: start,
        [Op.lte]: end,
    };

    const responsesByPeriod = await Resposta.findAll({
        where: whereClause,
        attributes: [
            [formatDateTz('day', 'createdAt'), 'period'],
            [fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'count']
        ],
        group: ['period'],
        order: [[literal('MIN("createdAt")'), 'ASC']],
        raw: true,
    });

    const dataMap = new Map(responsesByPeriod.map(item => [item.period, parseInt(item.count, 10)]));
    const intervalDays = eachDayOfInterval({ start, end });

    const chartData = intervalDays.map(day => {
        const key = format(day, 'dd/MM/yyyy');
        return {
            name: format(day, 'dd/MM'),
            Respostas: dataMap.get(key) || 0,
        };
    });

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
        // Assumindo que a data de utilização é refletida no updatedAt
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

const getTrendData = async (config) => {
    const { tenantId, period = 'day', startDate, endDate, surveyId, model, include, attributes, groupCol } = config;

    const whereClause = tenantId ? { tenantId } : {};
    if (surveyId && model.name === 'Resposta') {
        whereClause.pesquisaId = surveyId;
    }

    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;
    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const trendData = await model.findAll({
        where: whereClause,
        include: include,
        attributes: [
            [formatDateTz(period, groupCol), 'period'],
            ...attributes
        ],
        group: [formatDateTz(period, groupCol)],
        order: [[literal(`MIN("${groupCol}")`), 'ASC']],
        raw: true,
    });

    return trendData;
};

const getEvolutionDashboard = async function (tenantId = null, period = 'day', startDate = null, endDate = null) {
    const commonConfig = { tenantId, period, startDate, endDate };

    const npsTrendRaw = await getTrendData({
        ...commonConfig,
        model: Resposta,
        include: [{ model: Pergunta, as: 'pergunta', attributes: [], where: { type: 'rating_0_10' }, required: true }],
        attributes: [
            [fn('SUM', literal('CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END')), 'promoters'],
            [fn('SUM', literal('CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END')), 'detractors'],
            [fn('COUNT', col('Resposta.id')), 'total']
        ],
        groupCol: 'createdAt'
    });

    const csatTrendRaw = await getTrendData({
        ...commonConfig,
        model: Resposta,
        include: [{ model: Pergunta, as: 'pergunta', attributes: [], where: { type: 'rating_1_5' }, required: true }],
        attributes: [
            [fn('SUM', literal('CASE WHEN "ratingValue" >= 4 THEN 1 ELSE 0 END')), 'satisfied'],
            [fn('COUNT', col('Resposta.id')), 'total']
        ],
        groupCol: 'createdAt'
    });

    const responseCountTrendRaw = await getTrendData({
        ...commonConfig,
        model: Resposta,
        attributes: [[fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'responses']],
        groupCol: 'createdAt'
    });

    const registrationTrendRaw = await getTrendData({
        ...commonConfig,
        model: Client,
        attributes: [[fn('COUNT', col('id')), 'registrations']],
        groupCol: 'createdAt'
    });

    const evolutionData = {};

    const processTrend = (trend, key, calculation) => {
        trend.forEach(item => {
            if (!evolutionData[item.period]) {
                evolutionData[item.period] = { period: item.period };
            }
            evolutionData[item.period][key] = calculation ? calculation(item) : (item[key] || 0);
        });
    };

    processTrend(npsTrendRaw, 'nps', data => {
        const promoters = parseInt(data.promoters) || 0;
        const detractors = parseInt(data.detractors) || 0;
        const total = parseInt(data.total) || 0;
        return total > 0 ? parseFloat((((promoters / total) - (detractors / total)) * 100).toFixed(1)) : 0;
    });

    processTrend(csatTrendRaw, 'satisfaction', data => {
        const satisfied = parseInt(data.satisfied) || 0;
        const total = parseInt(data.total) || 0;
        return total > 0 ? parseFloat(((satisfied / total) * 100).toFixed(1)) : 0;
    });

    processTrend(responseCountTrendRaw, 'responses', data => parseInt(data.responses));
    processTrend(registrationTrendRaw, 'registrations', data => parseInt(data.registrations));

    return Object.values(evolutionData).sort((a, b) => {
        const dateA = new Date(a.period.split('/').reverse().join('-'));
        const dateB = new Date(b.period.split('/').reverse().join('-'));
        return dateA - dateB;
    });
};

module.exports = {
    getResponseChart,
    getConversionChart,
    getEvolutionDashboard,
};

