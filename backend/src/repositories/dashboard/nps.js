const { Resposta, Pergunta } = require('../../../models');
const { Op } = require('sequelize');
const ratingService = require('../../services/ratingService');

const getNpsByDayOfWeek = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId, ratingValue: { [Op.ne]: null } } : { ratingValue: { [Op.ne]: null } };
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;

    if (Object.keys(dateFilter).length > 0) {
        whereClause.createdAt = dateFilter;
    }

    const responses = await Resposta.findAll({
        where: whereClause,
        include: [{
            model: Pergunta,
            as: 'pergunta',
            attributes: ['type'],
            where: {
                type: 'rating_0_10'
            },
            required: true
        }],
        attributes: ['createdAt', 'ratingValue']
    });

    const npsByDay = {
        'Domingo': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
        'Segunda-feira': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
        'Terça-feira': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
        'Quarta-feira': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
        'Quinta-feira': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
        'Sexta-feira': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
        'Sábado': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
    };

    const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    responses.forEach(response => {
        const dayOfWeek = new Date(response.createdAt).getDay(); // 0 for Sunday, 6 for Saturday
        const dayName = daysOfWeek[dayOfWeek];

        const classification = ratingService.classifyNPS(response.ratingValue);

        if (classification) {
            npsByDay[dayName].total++;
            if (classification === 'promoter') npsByDay[dayName].promoters++;
            else if (classification === 'neutral') npsByDay[dayName].neutrals++;
            else if (classification === 'detractor') npsByDay[dayName].detractors++;
        }
    });

    const result = Object.entries(npsByDay).map(([day, counts]) => {
        let npsScore = 0;
        if (counts.total > 0) {
            npsScore = ((counts.promoters / counts.total) * 100) - ((counts.detractors / counts.total) * 100);
        }
        return {
            day,
            nps: parseFloat(npsScore.toFixed(1)),
        };
    });

    return result;
};

module.exports = {
    getNpsByDayOfWeek,
};