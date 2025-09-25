const { Pesquisa, Pergunta, Resposta, Tenant, Atendente } = require("../../models"); // Adicionar Atendente
const { sequelize } = require("../database"); // Importa a instância do Sequelize para transações
const ApiError = require("../errors/ApiError"); // Importar ApiError para validações
const { v4: uuidv4 } = require('uuid'); // Adicionar import do uuid

const getAtendentesByTenantId = async (tenantId) => {
  const atendentes = await Atendente.findAll({
    where: { 
      tenantId,
      status: 'active' // Apenas atendentes ativos
    },
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  });
  return atendentes;
};

const getPublicSurveyById = async (id) => {
  const survey = await Pesquisa.findByPk(id, {
    attributes: ['id', 'title', 'description', 'createdAt', 'updatedAt', 'isOpen', 'tenantId', 'askForAttendant', 'status'], // Adicionar 'status'
    include: [{
      model: Pergunta,
      as: 'perguntas', // Certifique-se de que 'as' corresponde à associação definida no modelo Pesquisa
      attributes: ['id', 'type', 'text', 'options', 'order', 'required'], // Adicionar 'required'
      order: [['order', 'ASC']],
    }, {
      model: Tenant, // Incluir o modelo Tenant
      as: 'tenant', // Usar 'as' se houver uma associação definida no modelo Pesquisa
      attributes: ['name', 'logoUrl', 'description'], // Selecionar os atributos desejados do Tenant
      required: false, // Adicionar para fazer um LEFT JOIN
    }],
  });

  if (!survey) {
    return null;
  }

  // Formata o resultado para corresponder ao formato original do pool.query
  const formattedSurvey = {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    createdAt: survey.createdAt,
    updatedAt: survey.updatedAt,
    isOpen: survey.isOpen, // Adicionar isOpen aqui
    tenantId: survey.tenantId, // Adicionar tenantId aqui
    askForAttendant: survey.askForAttendant, // ADDED THIS LINE
    status: survey.status, // Adicionar status aqui
    // Adicionar informações do Tenant
    restaurantName: survey.tenant ? survey.tenant.name : null,
    restaurantLogoUrl: survey.tenant ? survey.tenant.logoUrl : null,
    restaurantDescription: survey.tenant ? survey.tenant.description : null,
    questions: survey.perguntas.map(question => {
      let parsedOptions = question.options;
      if (typeof question.options === 'string') {
        try {
          parsedOptions = JSON.parse(question.options);
        } catch (e) {
          console.error("Failed to parse question options:", question.options, e);
          parsedOptions = []; // Fallback to empty array on parse error
        }
      }
      // Ensure it's an array, even if JSON.parse returned something else or it was null/undefined
      if (!Array.isArray(parsedOptions)) {
        parsedOptions = [];
      }

      return {
        id: question.id,
        type: question.type,
        text: question.text,
        options: parsedOptions, // Use the potentially parsed/defaulted options
        order: question.order,
        required: question.required, // Adicionar 'required'
      };
    }),
  };
  return formattedSurvey;
};

const submitSurveyResponses = async (surveyId, responses, respondentSessionId, clienteId, atendenteId) => {
  const transaction = await sequelize.transaction();
  try {
    const survey = await Pesquisa.findByPk(surveyId, {
      attributes: ['isOpen', 'tenantId', 'askForAttendant'],
      include: [{
        model: Pergunta,
        as: 'perguntas',
        attributes: ['id', 'type', 'options', 'required', 'text'],
      }],
      transaction,
    });

    if (!survey) {
      throw new ApiError(404, "Pesquisa não encontrada.");
    }

    if (!survey.isOpen) {
      throw new ApiError(403, "Esta pesquisa não está aberta para novas respostas.");
    }

    const questionsMap = new Map(survey.perguntas.map(q => [q.id, q]));

    const responsesToCreate = [];
    for (const res of responses) {
      const question = questionsMap.get(res.perguntaId);

      if (!question) {
        throw new ApiError(400, `Pergunta com ID ${res.perguntaId} não encontrada na pesquisa.`);
      }

      // Mapeamento do valor da resposta para o campo correto no banco de dados
      const responseData = {
        pesquisaId: surveyId,
        perguntaId: res.perguntaId,
        respondentSessionId: respondentSessionId,
        clienteId: clienteId,
        tenantId: survey.tenantId,
        atendenteId: atendenteId,
        textValue: res.comentario || null, // Comentário vai para textValue
      };

      switch (question.type) {
        case 'rating_1_5':
        case 'rating_0_10':
          responseData.ratingValue = res.valor;
          // O comentário já foi adicionado acima
          break;
        case 'free_text':
          // Para texto livre, a resposta principal também vai para textValue
          responseData.textValue = res.valor;
          break;
        case 'multiple_choice':
        case 'checkbox':
          responseData.selectedOption = res.valor;
          break;
        default:
          // Ignorar tipos de pergunta desconhecidos ou lançar um erro
          continue;
      }
      
      if (question.required && (res.valor === undefined || res.valor === null || res.valor === '')) {
        throw new ApiError(400, `A pergunta "${question.text}" é obrigatória.`);
      }

      responsesToCreate.push(responseData);
    }

    await Resposta.bulkCreate(responsesToCreate, { transaction });

    await transaction.commit();
    return { respondentSessionId: respondentSessionId };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const findTenantIdBySession = async (respondentSessionId) => {
  const response = await Resposta.findOne({
    where: { respondentSessionId },
    attributes: ['tenantId'],
  });
  return response ? response.tenantId : null;
};

const linkResponsesToClient = async (respondentSessionId, clienteId, transaction) => {
  await Resposta.update(
    { clienteId },
    { where: { respondentSessionId, clienteId: null }, transaction }
  );
};

const getPublicTenantById = async (id) => {
  const tenant = await Tenant.findByPk(id, {
    attributes: ['id', 'name', 'logoUrl', 'primaryColor', 'secondaryColor', 'description'],
  });
  return tenant;
};

module.exports = {
  getPublicSurveyById,
  getAtendentesByTenantId,
  submitSurveyResponses,
  findTenantIdBySession,
  linkResponsesToClient,
  getPublicTenantById,
};
