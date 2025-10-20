const { Pesquisa, Pergunta, Resposta, Usuario, Tenant, Criterio, Atendente, Client } = require("../../models");
const { sequelize } = require("../database");
const { Op } = require('sequelize');
const ApiError = require("../errors/ApiError");

const createSurvey = async (surveyData) => {
  const {
    tenantId,
    creatorId,
    title,
    description,
    questions,
    isOpen,
    askForAttendant,
    expectedRespondents,
    atendenteId,
    status,
    dueDate,
    startDate,
    endDate,
    recompensaId,
    roletaId,
  } = surveyData;

  const transaction = await sequelize.transaction();
  try {
    const newSurvey = await Pesquisa.create({
      tenantId,
      creatorId,
      title,
      description,
      isOpen,
      askForAttendant,
      expectedRespondents,
      atendenteId,
      status,
      dueDate,
      startDate,
      endDate,
      recompensaId,
      roletaId,
    }, { transaction });

    if (questions && questions.length > 0) {
      const questionsToCreate = questions.map((q, index) => {
        if (!q.text) {
          throw new ApiError(400, `O texto da pergunta ${index + 1} é obrigatório.`);
        }
        return {
          pesquisaId: newSurvey.id,
          text: q.text,
          type: q.type,
          options: q.options || null,
          order: index + 1,
          criterioId: q.criterioId || null,
        };
      });
      await Pergunta.bulkCreate(questionsToCreate, { transaction });
    }

    await transaction.commit();
    return { ...newSurvey.toJSON(), questions: questions || [] };
  } catch (error) {
    await transaction.rollback();
    console.error('[SurveyRepository] Transaction rolled back due to error:', error);
    throw error;
  }
};

const getSurveyById = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, tenantId } : { id };
  const survey = await Pesquisa.findByPk(id, {
    where: whereClause,
    include: [
      { model: Usuario, as: 'creator', attributes: ['name'] },
      {
        model: Pergunta,
        as: 'perguntas',
        attributes: ['id', 'text', 'type', 'options', 'order', 'criterioId'],
        order: [['order', 'ASC']],
      },
    ],
    attributes: ['id', 'title', 'description', 'createdAt', 'tenantId', 'isOpen', 'askForAttendant', 'expectedRespondents', 'startDate', 'endDate', 'dueDate', 'status', 'creatorId', 'recompensaId', 'roletaId'],
  });

  if (!survey) return null;

  return {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    createdAt: survey.createdAt,
    tenantId: survey.tenantId,
    creatorName: survey.creator ? survey.creator.name : null,
    isOpen: survey.isOpen,
    askForAttendant: survey.askForAttendant,
    expectedRespondents: survey.expectedRespondents,
    startDate: survey.startDate,
    endDate: survey.endDate,
    dueDate: survey.dueDate,
    status: survey.status,
    creatorId: survey.creatorId,
    recompensaId: survey.recompensaId,
    roletaId: survey.roletaId,
    questions: survey.perguntas.map(q => ({
      ...q.toJSON(),
    })),
  };
};

const updateSurvey = async (id, surveyData, tenantId = null) => {
  const {
    title,
    description,
    questions,
    isOpen,
    askForAttendant,
    expectedRespondents,
    atendenteId,
    status,
    dueDate,
    startDate,
    endDate,
    recompensaId,
    roletaId,
  } = surveyData;

  const transaction = await sequelize.transaction();
  try {
    const whereClause = tenantId ? { id, tenantId } : { id };

    // 1. Atualiza os dados da pesquisa principal
    const [updatedRows] = await Pesquisa.update({
      title, description, isOpen, askForAttendant, expectedRespondents, atendenteId, status, dueDate, startDate, endDate, recompensaId, roletaId
    }, { where: whereClause, transaction });

    if (updatedRows === 0) {
      await transaction.rollback();
      return null;
    }

    // 2. Busca as perguntas existentes no banco
    const existingQuestions = await Pergunta.findAll({ where: { pesquisaId: id }, transaction });
    const existingQuestionIds = existingQuestions.map(q => q.id);
    const incomingQuestionIds = questions.map(q => q.id).filter(qId => qId); // Filtra IDs undefined/null

    // 3. Determina as ações (criar, atualizar, deletar)
    const questionIdsToDelete = existingQuestionIds.filter(qId => !incomingQuestionIds.includes(qId));
    const questionsToCreate = questions.filter(q => !q.id);
    const questionsToUpdate = questions.filter(q => q.id && existingQuestionIds.includes(q.id));

    // 4. Executa as ações
    if (questionIdsToDelete.length > 0) {
      await Pergunta.destroy({ where: { id: questionIdsToDelete }, transaction });
    }

    if (questionsToCreate.length > 0) {
      const newQuestions = questionsToCreate.map((q, index) => ({
        pesquisaId: id,
        text: q.text,
        type: q.type,
        options: q.options || null,
        order: questions.findIndex(iq => iq === q) + 1, // Mantém a ordem da requisição
        criterioId: q.criterioId || null,
      }));
      await Pergunta.bulkCreate(newQuestions, { transaction });
    }

    if (questionsToUpdate.length > 0) {
      for (const q of questionsToUpdate) {
        await Pergunta.update({
          text: q.text,
          type: q.type,
          options: q.options || null,
          order: questions.findIndex(iq => iq.id === q.id) + 1, // Mantém a ordem da requisição
          criterioId: q.criterioId || null,
        }, { where: { id: q.id }, transaction });
      }
    }

    await transaction.commit();

    // 5. Retorna a pesquisa atualizada com todas as perguntas
    const finalSurvey = await Pesquisa.findByPk(id, {
      include: [{ model: Pergunta, as: 'perguntas', order: [['order', 'ASC']] }],
    });
    return finalSurvey;

  } catch (error) {
    await transaction.rollback();
    console.error("Error updating survey:", error);
    throw error;
  }
};

const deleteSurvey = async (id, tenantId = null) => {
  const transaction = await sequelize.transaction();
  try {
    const whereClause = tenantId ? { id, tenantId } : { id };
    await Pergunta.destroy({ where: { pesquisaId: id }, transaction });
    const deletedRows = await Pesquisa.destroy({
      where: whereClause,
      transaction
    });
    await transaction.commit();
    return deletedRows;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getSurveyTenantIdAndCreatorId = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, tenantId } : { id };
  return Pesquisa.findByPk(id, {
    where: whereClause,
    attributes: ['tenantId', 'creatorId'],
  });
};

const getSurveyStats = async (tenantId = null) => {
  const whereClause = tenantId ? { tenantId } : {};
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const activeSurveys = await Pesquisa.count({
    where: { ...whereClause, status: 'active' }
  });

  const responsesMonth = await Resposta.count({
    where: { ...whereClause, createdAt: { [Op.gte]: startOfMonth } },
    distinct: true,
    col: 'respondentSessionId'
  });

  const totalClients = await Client.count({ where: { ...whereClause } });
  const responseRate = totalClients > 0 ? (responsesMonth / totalClients) * 100 : 0;

  const pendingSurveys = await Pesquisa.count({
    where: { ...whereClause, status: 'pending' }
  });

  return {
    activeSurveys,
    responsesMonth,
    responseRate: parseFloat(responseRate.toFixed(2)),
    pendingSurveys,
  };
};

const findAllForList = async (tenantId = null, status = 'all') => {
  const whereClause = tenantId ? { tenantId } : {};

  if (status && status !== 'all') {
    whereClause.status = status;
  }

  const surveys = await Pesquisa.findAll({
    where: whereClause,
    include: [
      {
        model: Pergunta,
        as: 'perguntas',
        attributes: ['id', 'text', 'type', 'options', 'order'],
      },
    ],
    attributes: [
      'id', 'title', 'description', 'createdAt', 'dueDate', 'status', 'isOpen', 'expectedRespondents', 'askForAttendant', 'tenantId'
    ],
    order: [['createdAt', 'DESC']],
  });

  const surveyIds = surveys.map(s => s.id);
  const respondentCounts = await Resposta.findAll({
    attributes: [
      'pesquisaId',
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('respondentSessionId'))), 'count']
    ],
    where: {
      pesquisaId: {
        [Op.in]: surveyIds
      }
    },
    group: ['pesquisaId']
  });

  const countsMap = respondentCounts.reduce((acc, curr) => {
    acc[curr.pesquisaId] = curr.get('count');
    return acc;
  }, {});

  return surveys.map(survey => ({
    ...survey.toJSON(),
    currentRespondents: countsMap[survey.id] || 0
  }));
};

const findResultsById = async (surveyId, tenantId = null) => {
  const whereClause = tenantId ? { id: surveyId, tenantId } : { id: surveyId };

  const survey = await Pesquisa.findOne({
    where: whereClause,
    include: [
      {
        model: Pergunta,
        as: 'perguntas',
        include: [
          {
            model: Resposta,
            as: 'respostas',
            attributes: ['ratingValue', 'textValue', 'selectedOption', 'respondentSessionId'],
            include: [{
              model: Client,
              as: 'client',
              attributes: ['name', 'email', 'phone', 'birthDate'],
            }]
          },
          {
            model: Criterio,
            as: 'criterio',
            attributes: ['name'],
          }
        ],
        order: [['order', 'ASC']],
      },
    ],
  });

  if (!survey) {
    return null;
  }

  const totalResponsesCount = await Resposta.count({
    where: { pesquisaId: surveyId },
    distinct: true,
    col: 'respondentSessionId'
  });

  return { survey, totalResponsesCount };
};

module.exports = {
  createSurvey,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  getSurveyTenantIdAndCreatorId,
  getSurveyStats,
  findAllForList,
  findResultsById,
};
