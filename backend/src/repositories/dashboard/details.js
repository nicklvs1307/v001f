const { Resposta, Client, Cupom, Pergunta } = require('../../../models');
const { Op } = require('sequelize');

const getDetailsByCategory = async (tenantId, category, startDate, endDate) => {
    const whereClause = tenantId ? { tenantId } : {};
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;

    if (Object.keys(dateFilter).length > 0) {
        whereClause.createdAt = dateFilter;
    }

    const categoryLower = category.toLowerCase();
    let ratingWhere = {};

    switch (categoryLower) {
        case 'promotores':
            ratingWhere = { '$pergunta.type$': 'rating_0_10', ratingValue: { [Op.gte]: 9 } };
            break;
        case 'neutros': // NPS Neutral
            ratingWhere = { '$pergunta.type$': 'rating_0_10', ratingValue: { [Op.between]: [7, 8] } };
            break;
        case 'detratores':
            ratingWhere = { '$pergunta.type$': 'rating_0_10', ratingValue: { [Op.lte]: 6 } };
            break;
        case 'satisfeitos': // CSAT Satisfied
            ratingWhere = { '$pergunta.type$': 'rating_1_5', ratingValue: { [Op.gte]: 4 } };
            break;
        case 'neutros-csat': // CSAT Neutral
            ratingWhere = { '$pergunta.type$': 'rating_1_5', ratingValue: { [Op.eq]: 3 } };
            break;
        case 'insatisfeitos': // CSAT Unsatisfied
            ratingWhere = { '$pergunta.type$': 'rating_1_5', ratingValue: { [Op.lte]: 2 } };
            break;
        case 'cadastros':
            return await Client.findAll({ where: whereClause, order: [['createdAt', 'DESC']] });
        case 'cupons gerados':
            return await Cupom.findAll({ where: whereClause, include: [{ model: Client, as: 'cliente', attributes: ['name'] }], order: [['createdAt', 'DESC']] });
        case 'cupons utilizados':
            const usedWhere = { ...whereClause, status: 'used' };
            if (whereClause.createdAt) {
                usedWhere.updatedAt = whereClause.createdAt;
                delete usedWhere.createdAt;
            }
            return await Cupom.findAll({ where: usedWhere, include: [{ model: Client, as: 'cliente', attributes: ['name'] }], order: [['updatedAt', 'DESC']] });
        default:
            return [];
    }

    if (Object.keys(ratingWhere).length > 0) {
        return await Resposta.findAll({
            where: { ...whereClause, ...ratingWhere },
            include: [
                { model: Client, as: 'cliente', attributes: ['name'] },
                { model: Pergunta, as: 'pergunta', attributes: ['text', 'type'] }
            ],
            order: [['createdAt', 'DESC']],
        });
    }

    return [];
};

const getResponseDetailsBySessionId = async (tenantId, sessionId) => {
    const whereClause = { respondentSessionId: sessionId };
    if (tenantId) {
        whereClause.tenantId = tenantId;
    }

    const responses = await Resposta.findAll({
        where: whereClause,
        include: [
            { model: Client, as: 'client', attributes: ['name'] },
            { model: Pergunta, as: 'pergunta', attributes: ['text'] }
        ],
        order: [['createdAt', 'ASC']],
    });

    return responses;
};

module.exports = {
    getDetailsByCategory,
    getResponseDetailsBySessionId,
};