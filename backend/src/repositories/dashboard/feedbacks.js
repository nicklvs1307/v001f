const { Resposta, Pergunta, Client, sequelize } = require('../../../models');
const { Op } = require('sequelize');
const { PorterStemmerPt } = require('natural');
const stopwords = require('../../utils/stopwords');

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

const getFeedbacks = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: '' } } : { textValue: { [Op.ne]: null, [Op.ne]: '' } };
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }
    
    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;
    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const feedbacksData = await Resposta.findAll({
        where: whereClause,
        attributes: [
            'textValue', 
            'ratingValue', 
            'respondentSessionId',
            [sequelize.fn('TO_CHAR', sequelize.literal(`"Resposta"."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'`), 'DD/MM/YYYY HH24:MI'), 'formattedCreatedAt']
        ],
        order: [['createdAt', 'DESC']],
        limit: 7,
        include: [{
            model: Client,
            as: 'cliente',
            attributes: ['name'],
            foreignKey: 'respondentSessionId',
            targetKey: 'respondentSessionId'
        }]
    });

    return feedbacksData.map(feedback => ({
        respondentSessionId: feedback.respondentSessionId,
        date: feedback.get('formattedCreatedAt'),
        client: feedback.cliente ? feedback.cliente.name : 'Anônimo',
        rating: feedback.ratingValue !== null ? feedback.ratingValue : null,
        comment: feedback.textValue,
    }));
};

const getWordCloudData = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: '' } } : { textValue: { [Op.ne]: null, [Op.ne]: '' } };
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }

    const dateFilter = (startDate || endDate) ? buildDateFilter(startDate, endDate) : null;
    if (dateFilter) {
        whereClause.createdAt = dateFilter;
    }

    const feedbacks = await Resposta.findAll({
        where: whereClause,
        attributes: ['textValue'],
        limit: 2000,
        order: [['createdAt', 'DESC']],
    });

    const text = feedbacks.map(f => f.textValue).join(' ');
    const words = text.toLowerCase().replace(/[.,!?;:"'()]/g, '').split(/\s+/);

    const frequencies = {};
    for (const word of words) {
        const stemmedWord = PorterStemmerPt.stem(word);
        if (stemmedWord && stemmedWord.length > 2 && !stopwords.has(word) && !stopwords.has(stemmedWord)) {
            frequencies[stemmedWord] = (frequencies[stemmedWord] || 0) + 1;
        }
    }

    return Object.entries(frequencies)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 100);
};

module.exports = {
    getFeedbacks,
    getWordCloudData,
};