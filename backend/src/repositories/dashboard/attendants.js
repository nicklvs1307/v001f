const { Resposta, Atendente, AtendenteMeta, Pergunta, Client, sequelize } = require('../../../models');
const { Op } = require('sequelize');
const ratingService = require('../../services/ratingService');

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

const getRanking = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId } : {};
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }
    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;

    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const rankingData = await Resposta.findAll({
        where: whereClause,
        attributes: [
            'atendenteId',
            [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('respondentSessionId'))), 'occurrences']
        ],
        group: ['atendenteId', 'atendente.id', 'atendente.name'],
        order: [[sequelize.literal('occurrences'), 'DESC']],
        limit: 5,
        include: [{
            model: Atendente,
            as: 'atendente',
            attributes: ['name']
        }]
    });

    const formattedRanking = rankingData.map((item, index) => ({
        atendenteId: item.atendenteId,
        ranking: `${index + 1}°`,
        name: item.atendente ? item.atendente.name : 'Desconhecido',
        occurrences: parseInt(item.dataValues.occurrences),
    }));

    return formattedRanking || [];
};

const getAttendantsPerformanceWithGoals = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId } : {};
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }

    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;

    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const allResponses = await Resposta.findAll({
        where: { ...whereClause, ratingValue: { [Op.ne]: null } },
        include: [
            {
                model: Pergunta,
                as: 'pergunta',
                attributes: ['type'],
            },
            {
                model: Client,
                as: 'cliente',
                attributes: ['id'],
            },
            {
                model: Atendente,
                as: 'atendente',
                attributes: ['id', 'name'],
            }
        ]
    });

    const attendantPerformance = allResponses.reduce((acc, response) => {
        if (response.atendente && response.atendente.id) {
            const attendantId = response.atendente.id;
            if (!acc[attendantId]) {
                acc[attendantId] = {
                    id: attendantId,
                    name: response.atendente.name,
                    responses: [],
                    uniqueClients: new Set(),
                };
            }
            acc[attendantId].responses.push(response);
            if (response.client && response.client.id) {
                acc[attendantId].uniqueClients.add(response.client.id);
            }
        }
        return acc;
    }, {});

    const attendantsWithPerformance = [];
    for (const attendantStats of Object.values(attendantPerformance)) {
        const npsResult = ratingService.calculateNPS(attendantStats.responses);
        const csatResult = ratingService.calculateCSAT(attendantStats.responses);
        const meta = await AtendenteMeta.findOne({
            where: { atendenteId: attendantStats.id, tenantId: tenantId },
        });

        attendantsWithPerformance.push({
            id: attendantStats.id,
            name: attendantStats.name,
            responses: attendantStats.responses.length,
            currentNPS: npsResult.npsScore,
            currentCSAT: csatResult.averageScore,
            currentRegistrations: attendantStats.uniqueClients.size,
            npsGoal: meta ? meta.npsGoal || 0 : 0,
            csatGoal: meta ? meta.csatGoal || 0 : 0, // Assuming a csatGoal might exist
            responsesGoal: meta ? meta.responsesGoal || 0 : 0,
            registrationsGoal: meta ? meta.registrationsGoal || 0 : 0,
        });
    }

    return attendantsWithPerformance;
};

const getAttendantDetailsById = async (tenantId, attendantId, startDate, endDate) => {
    const whereClause = { atendenteId: attendantId };
    if (tenantId) {
        whereClause.tenantId = tenantId;
    }

    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;

    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const responses = await Resposta.findAll({
        where: whereClause,
        attributes: {
            include: [
                [sequelize.fn('TO_CHAR', sequelize.literal(`"Resposta"."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'`), 'DD/MM/YYYY HH24:MI'), 'formattedCreatedAt']
            ]
        },
        include: [
            { model: Client, as: 'cliente', attributes: ['name'] },
            { 
                model: Pergunta, 
                as: 'pergunta', 
                attributes: ['text', 'type']
            }
        ],
        order: [['createdAt', 'DESC']],
    });

    const ratingResponses = responses.filter(r => r.ratingValue !== null && r.pergunta && r.pergunta.type.startsWith('rating'));

    const npsResult = ratingService.calculateNPS(ratingResponses);
    const csatResult = ratingService.calculateCSAT(ratingResponses);
    const attendant = await Atendente.findByPk(attendantId, { attributes: ['name'] });

    return {
        attendantName: attendant ? attendant.name : 'Desconhecido',
        nps: npsResult,
        csat: csatResult,
        totalResponses: responses.length,
        responses,
    };
};

module.exports = {
    getRanking,
        getAttendantsPerformanceWithGoals,
        getAttendantDetailsById,
        getRanking,
    };
    