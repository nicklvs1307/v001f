const { Resposta, Pergunta, Client } = require('../../../models');
const { Op } = require('sequelize');
const { PorterStemmerPt } = require('natural');
const stopwords = require('../../utils/stopwords');

const getFeedbacks = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
    const whereClause = tenantId ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: '' } } : { textValue: { [Op.ne]: null, [Op.ne]: '' } };
    if (surveyId) {
        whereClause.pesquisaId = surveyId;
    }
    
    if (startDate && endDate) {
        whereClause.createdAt = {
            [Op.between]: [startDate, endDate],
        };
    }

    const feedbacksData = await Resposta.findAll({
        where: whereClause,
        attributes: ['createdAt', 'textValue', 'ratingValue', 'respondentSessionId'],
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
        date: new Date(feedback.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
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

    if (startDate && endDate) {
        whereClause.createdAt = {
            [Op.between]: [startDate, endDate],
        };
    }

    const feedbacks = await Resposta.findAll({
        where: whereClause,
        attributes: ['textValue'],
        limit: 2000,
        include: [{
            model: Pergunta,
            as: 'pergunta',
            attributes: [], // Não precisamos de atributos da pergunta, apenas para o filtro
            where: {
                type: {
                    [Op.in]: ['text', 'textarea'],
                },
            },
            required: true, // Garante que apenas respostas com perguntas correspondentes sejam retornadas
        }],
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