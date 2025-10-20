const { Pesquisa, Pergunta, Resposta } = require("../../models"); // Importa os modelos do Sequelize
const { Op, Sequelize } = require('sequelize');

const getSurveyDetails = async (surveyId, tenantId = null) => {
  const whereClause = tenantId ? { id: surveyId, tenantId } : { id: surveyId };
  return Pesquisa.findByPk(surveyId, {
    where: whereClause,
    attributes: ['id', 'title', 'description', 'tenantId'],
  });
};

const getQuestionsBySurveyId = async (surveyId, tenantId = null) => {
  const whereClause = tenantId ? { pesquisaId: surveyId, tenantId } : { pesquisaId: surveyId };
  return Pergunta.findAll({
    where: whereClause,
    attributes: ['id', 'text', 'type', 'options'],
    order: [['order', 'ASC']],
  });
};

const getResponsesBySurveyId = async (surveyId, tenantId = null) => {
  const whereClause = tenantId ? { tenantId } : {};
  return Resposta.findAll({
    attributes: ['perguntaId', 'respondentSessionId', 'ratingValue', 'textValue', 'selectedOption'],
    where: whereClause,
    include: [{
      model: Pergunta,
      as: 'pergunta', // Certifique-se de que 'as' corresponde à associação definida no modelo Resposta
      where: { pesquisaId: surveyId },
      attributes: [], // Não precisamos dos atributos da pergunta aqui, apenas para o filtro
      required: true,
    }],
  });
};

const getDailyStats = async (tenantId) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
  const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

  const stats = await Resposta.findAll({
    where: {
      tenantId,
      createdAt: {
        [Op.between]: [startOfYesterday, endOfYesterday],
      },
    },
    include: [{
      model: Pergunta,
      as: 'pergunta',
      attributes: [],
      where: {
        type: 'rating_0_10' // Focando apenas em respostas de perguntas NPS para classificação
      },
      required: true
    }],
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.col('Resposta.id')), 'totalResponses'],
      [Sequelize.literal(`SUM(CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END)`), 'promoters'],
      [Sequelize.literal(`SUM(CASE WHEN "ratingValue" >= 7 AND "ratingValue" <= 8 THEN 1 ELSE 0 END)`), 'neutrals'],
      [Sequelize.literal(`SUM(CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END)`), 'detractors'],
    ],
    raw: true,
  });

  // Como o resultado é um array com um objeto, retornamos o primeiro objeto ou um objeto zerado.
  const result = stats[0];
  return {
    totalResponses: parseInt(result.totalResponses, 10) || 0,
    promoters: parseInt(result.promoters, 10) || 0,
    neutrals: parseInt(result.neutrals, 10) || 0,
    detractors: parseInt(result.detractors, 10) || 0,
  };
};

module.exports = {
  getSurveyDetails,
  getQuestionsBySurveyId,
  getResponsesBySurveyId,
  getDailyStats,
};
