const { Resposta, Pergunta, Client, Cupom, sequelize } = require('../../../models');
const { fromZonedTime, toZonedTime } = require('date-fns-tz');
const { Op } = require('sequelize');
const { getBirthdaysOfMonth } = require('./clients');
const ratingService = require('../../services/ratingService');

const timeZone = 'America/Sao_Paulo';

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

const getSummary = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;

    const ratingResponsesWhere = {
        ratingValue: { [Op.ne]: null }
    };
    if (tenantId) ratingResponsesWhere.tenantId = tenantId;
    if (surveyId) ratingResponsesWhere.pesquisaId = surveyId;
    if (dateFilter) ratingResponsesWhere.createdAt = dateFilter;

    const ratingResponses = await Resposta.findAll({
        where: ratingResponsesWhere,
        include: [{
            model: Pergunta,
            as: 'pergunta',
            attributes: ['type'],
            where: {
                type: { [Op.or]: ['rating_0_10', 'rating_1_5'] }
            },
            required: true
        }],
    });

    const npsResponses = ratingResponses.filter(r => r.pergunta.type === 'rating_0_10');
    const csatResponses = ratingResponses.filter(r => r.pergunta.type === 'rating_1_5');

    const npsResult = ratingService.calculateNPS(npsResponses);
    const csatResult = ratingService.calculateCSAT(csatResponses);
    
    const ambassadorsInPeriod = npsResponses.filter(r => r.ratingValue >= 9).length;
    
    const totalResponsesWhere = {
        respondentSessionId: { [Op.ne]: null }
    };
    if (tenantId) totalResponsesWhere.tenantId = tenantId;
    if (surveyId) totalResponsesWhere.pesquisaId = surveyId;
    if (dateFilter) totalResponsesWhere.createdAt = dateFilter;
    const totalResponses = await Resposta.count({ where: totalResponsesWhere, distinct: true, col: 'respondentSessionId' });
    
    const clientWhereClause = tenantId ? { tenantId } : {};
    if (dateFilter) clientWhereClause.createdAt = dateFilter;

    if (surveyId) {
        const respondentClientIds = await Resposta.findAll({
            where: {
                pesquisaId: surveyId,
                clientId: { [Op.ne]: null }
            },
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('clientId')), 'clientId']]
        });
        const clientIds = respondentClientIds.map(r => r.dataValues.clientId);
        clientWhereClause.id = { [Op.in]: clientIds };
    }
    const totalUsers = await Client.count({ where: clientWhereClause });

    const couponsGeneratedWhere = tenantId ? { tenantId } : {};
    if (surveyId) couponsGeneratedWhere.pesquisaId = surveyId;
    if (dateFilter) couponsGeneratedWhere.createdAt = dateFilter;
    const couponsGenerated = await Cupom.count({ where: couponsGeneratedWhere });

    const couponsUsedWhere = { status: 'used' };
    if (tenantId) couponsUsedWhere.tenantId = tenantId;
    if (surveyId) couponsUsedWhere.pesquisaId = surveyId;
    if (dateFilter) couponsUsedWhere.updatedAt = dateFilter;
    const couponsUsed = await Cupom.count({ where: couponsUsedWhere });

    const birthdays = await getBirthdaysOfMonth(tenantId);
    const ambassadorsMonth = birthdays.length;

    return {
        nps: {
            score: npsResult.npsScore,
            promoters: npsResult.promoters,
            neutrals: npsResult.neutrals,
            detractors: npsResult.detractors,
            total: npsResult.total,
        },
        csat: {
            satisfactionRate: csatResult.satisfactionRate,
            averageScore: csatResult.averageScore,
            satisfied: csatResult.satisfied,
            neutral: csatResult.neutral,
            unsatisfied: csatResult.unsatisfied,
            total: csatResult.total,
        },
        registrations: totalUsers,
        registrationsConversion: totalResponses > 0 ? parseFloat(((totalUsers / totalResponses) * 100).toFixed(2)) : 0,
        couponsGenerated,
        couponsUsed,
        couponsUsedConversion: couponsGenerated > 0 ? parseFloat(((couponsUsed / couponsGenerated) * 100).toFixed(2)) : 0,
        totalResponses,
        totalUsers,
        ambassadorsInPeriod,
        ambassadorsMonth,
        couponsGeneratedPeriod: startDate && endDate ? `de ${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}` : 'Desde o início',
    };
};

const getMonthSummary = async (tenantId = null, startDate = null, endDate = null) => {
    const whereClause = tenantId ? { tenantId } : {};
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    if (Object.keys(dateFilter).length > 0) {
        whereClause.createdAt = dateFilter;
    }

    const npsResponses = await Resposta.findAll({
        where: {
            ...whereClause,
            ratingValue: { [Op.ne]: null }
        },
        include: [{
            model: Pergunta,
            as: 'pergunta',
            attributes: ['type'],
            where: { type: 'rating_0_10' },
            required: true
        }, {
            model: Client,
            as: 'client',
            attributes: ['id'] // We only need to check for its existence
        }],
        attributes: ['id', 'ratingValue', 'createdAt'],
        order: [['createdAt', 'ASC']]
    });

    // 1. Daily distribution and NPS
    const dailyData = {};
    let accumulatedPromoters = 0;
    let accumulatedNeutrals = 0;
    let accumulatedDetractors = 0;
    let accumulatedTotal = 0;

    npsResponses.forEach(response => {
        const zonedDate = toZonedTime(response.createdAt, timeZone);
        const day = zonedDate.toISOString().split('T')[0];
        if (!dailyData[day]) {
            dailyData[day] = { promoters: 0, neutrals: 0, detractors: 0, total: 0 };
        }

        const classification = ratingService.classifyNPS(response.ratingValue);
        if (classification) {
            dailyData[day][`${classification}s`]++;
            dailyData[day].total++;
        }
    });

    const dailyNps = Object.keys(dailyData).map(day => {
        const dayData = dailyData[day];
        const totalDaily = dayData.total;
        const npsScore = totalDaily > 0 ? ((dayData.promoters / totalDaily) * 100) - ((dayData.detractors / totalDaily) * 100) : 0;
        
        accumulatedPromoters += dayData.promoters;
        accumulatedNeutrals += dayData.neutrals;
        accumulatedDetractors += dayData.detractors;
        accumulatedTotal += dayData.total;
        
        const accumulatedNps = accumulatedTotal > 0 ? ((accumulatedPromoters / accumulatedTotal) * 100) - ((accumulatedDetractors / accumulatedTotal) * 100) : 0;

        return {
            date: day,
            promoters: dayData.promoters,
            neutrals: dayData.neutrals,
            detractors: dayData.detractors,
            nps: parseFloat(npsScore.toFixed(1)),
            accumulatedNps: parseFloat(accumulatedNps.toFixed(1))
        };
    });

    // 2. Peak response times
    const responsesByHour = await Resposta.findAll({
        where: whereClause,
        attributes: [
            [sequelize.fn('EXTRACT', sequelize.literal(`HOUR FROM "createdAt" AT TIME ZONE '${timeZone}'`)), 'hour'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('EXTRACT', sequelize.literal(`HOUR FROM "createdAt" AT TIME ZONE '${timeZone}'`))],
        order: [[sequelize.fn('EXTRACT', sequelize.literal(`HOUR FROM "createdAt" AT TIME ZONE '${timeZone}'`)), 'ASC']]
    });
    
    const peakHours = responsesByHour.map(item => ({
        hour: parseInt(item.dataValues.hour),
        count: parseInt(item.dataValues.count)
    }));

    // 3. Distribution by day of the week
    const responsesByWeekday = await Resposta.findAll({
        where: whereClause,
        attributes: [
            [sequelize.fn('EXTRACT', sequelize.literal(`ISODOW FROM "createdAt" AT TIME ZONE '${timeZone}'`)), 'weekday'], // 1=Monday, 7=Sunday
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('EXTRACT', sequelize.literal(`ISODOW FROM "createdAt" AT TIME ZONE '${timeZone}'`))],
        order: [[sequelize.fn('EXTRACT', sequelize.literal(`ISODOW FROM "createdAt" AT TIME ZONE '${timeZone}'`)), 'ASC']]
    });

    const weekdays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const weekdayDistribution = responsesByWeekday.map(item => ({
        day: weekdays[parseInt(item.dataValues.weekday) - 1],
        count: parseInt(item.dataValues.count)
    }));

    // 4. Total responses
    const totalResponses = await Resposta.count({ where: whereClause });

    // 5. Registered vs. Unregistered
    const registeredResponses = npsResponses.filter(r => r.client).length;
    const unregisteredResponses = npsResponses.length - registeredResponses;
    const clientProportion = {
        registered: registeredResponses,
        unregistered: unregisteredResponses,
        total: npsResponses.length
    };

    return {
        dailyNps,
        peakHours,
        weekdayDistribution,
        totalResponses,
        clientProportion
    };
};


module.exports = {
    getSummary,
    getMonthSummary,
};