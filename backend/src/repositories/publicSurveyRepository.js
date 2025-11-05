const { Pesquisa, Pergunta, Resposta, Tenant, Atendente, Roleta } = require("../../models"); // Adicionar Atendente e Roleta
const whatsappService = require('../services/whatsappService');
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
    attributes: ['id', 'title', 'description', 'createdAt', 'updatedAt', 'isOpen', 'tenantId', 'askForAttendant', 'status', 'recompensaId', 'roletaId'], // Adicionar 'status', 'recompensaId', 'roletaId'
    include: [{
      model: Pergunta,
      as: 'perguntas', // Certifique-se de que 'as' corresponde à associação definida no modelo Pesquisa
      attributes: ['id', 'type', 'text', 'options', 'order', 'required'], // Adicionar 'required'
      order: [['order', 'ASC']],
    }, {
      model: Tenant, // Incluir o modelo Tenant
      as: 'tenant', // Usar 'as' se houver uma associação definida no modelo Pesquisa
      attributes: ['name', 'logoUrl', 'description', 'primaryColor', 'secondaryColor'], // Selecionar os atributos desejados do Tenant
      required: false, // Adicionar para fazer um LEFT JOIN
    }, {
      model: Roleta, // Incluir o modelo Roleta
      as: 'roleta', // Usar 'as' se houver uma associação definida no modelo Pesquisa
      attributes: ['id', 'nome', 'descricao', 'active'], // Selecionar os atributos desejados da Roleta
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
    roletaId: survey.roletaId, // Adicionar roletaId aqui
    // Adicionar informações do Tenant
    restaurantName: survey.tenant ? survey.tenant.name : null,
    restaurantLogoUrl: survey.tenant ? survey.tenant.logoUrl : null,
    restaurantDescription: survey.tenant ? survey.tenant.description : null,
    primaryColor: survey.tenant ? survey.tenant.primaryColor : null,
    secondaryColor: survey.tenant ? survey.tenant.secondaryColor : null,
    // Adicionar informações da Roleta
    roleta: survey.roleta ? {
      id: survey.roleta.id,
      nome: survey.roleta.nome,
      descricao: survey.roleta.descricao,
      active: survey.roleta.active,
    } : null,
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

const submitSurveyResponses = async (surveyId, responses, respondentSessionId, clienteId, atendenteId, io) => {
  console.log("submitSurveyResponses: Starting submission process");
  console.log(`submitSurveyResponses: surveyId=${surveyId}, respondentSessionId=${respondentSessionId}, clienteId=${clienteId}, atendenteId=${atendenteId}`);
  console.log("submitSurveyResponses: responses:", JSON.stringify(responses, null, 2));

  const transaction = await sequelize.transaction();
  console.log("submitSurveyResponses: Transaction started");

  try {
    const survey = await Pesquisa.findByPk(surveyId, {
      attributes: ['isOpen', 'tenantId', 'askForAttendant', 'title'],
      include: [{
        model: Pergunta,
        as: 'perguntas',
        attributes: ['id', 'type', 'options', 'required', 'text'],
      }],
      transaction,
    });

    if (!survey) {
      console.error("submitSurveyResponses: Survey not found");
      throw new ApiError(404, "Pesquisa não encontrada.");
    }
    console.log("submitSurveyResponses: Survey found:", survey.title);

    if (!survey.isOpen) {
      console.error("submitSurveyResponses: Survey is not open");
      throw new ApiError(403, "Esta pesquisa não está aberta para novas respostas.");
    }
    console.log("submitSurveyResponses: Survey is open");

    const questionsMap = new Map(survey.perguntas.map(q => [q.id, q]));
    console.log("submitSurveyResponses: Questions map created");

    const finalAtendenteId = atendenteId === '' ? null : atendenteId;
    console.log("submitSurveyResponses: finalAtendenteId=", finalAtendenteId);

    const responsesToCreate = [];
    for (const res of responses) {
      console.log("submitSurveyResponses: Processing response:", JSON.stringify(res, null, 2));
      const question = questionsMap.get(res.perguntaId);

      if (!question) {
        console.error(`submitSurveyResponses: Question with ID ${res.perguntaId} not found`);
        throw new ApiError(400, `Pergunta com ID ${res.perguntaId} não encontrada na pesquisa.`);
      }
      console.log("submitSurveyResponses: Question found:", question.text);

      // Mapeamento do valor da resposta para o campo correto no banco de dados
      const responseData = {
        pesquisaId: surveyId,
        perguntaId: res.perguntaId,
        respondentSessionId: respondentSessionId,
        clienteId: clienteId,
        tenantId: survey.tenantId,
        atendenteId: finalAtendenteId,
        textValue: res.comentario || null, // Comentário vai para textValue
      };

      switch (question.type) {
        case 'rating_1_5':
        case 'rating_0_10':
          responseData.ratingValue = res.valor;
          break;
        case 'free_text':
          responseData.textValue = res.valor;
          break;
        case 'multiple_choice':
        case 'checkbox':
          if (res.valor) {
            const valueAsArray = Array.isArray(res.valor) ? res.valor : [res.valor];
            responseData.selectedOption = JSON.stringify(valueAsArray);
          } else {
            responseData.selectedOption = null;
          }
          break;
        default:
          console.log(`submitSurveyResponses: Unknown question type ${question.type}, skipping`);
          continue;
      }
      
      if (question.required && (res.valor === undefined || res.valor === null || res.valor === '')) {
        console.error(`submitSurveyResponses: Required question "${question.text}" is missing a value`);
        throw new ApiError(400, `A pergunta "${question.text}" é obrigatória.`);
      }

      responsesToCreate.push(responseData);
      console.log("submitSurveyResponses: Response data prepared:", JSON.stringify(responseData, null, 2));
    }

    console.log("submitSurveyResponses: Preparing to bulk create responses:", JSON.stringify(responsesToCreate, null, 2));
    await Resposta.bulkCreate(responsesToCreate, { transaction });
    console.log("submitSurveyResponses: Bulk create successful");

    await transaction.commit();
    console.log("submitSurveyResponses: Transaction committed");

    // --- NOTIFICATION for new survey response ---
    if (io) {
        console.log("submitSurveyResponses: Sending real-time notification for new survey response");
        const notificationService = require('../services/NotificationService');
        notificationService.createNotification(io, {
            type: 'SURVEY_RESPONSE',
            message: `Nova resposta para a pesquisa "${survey.title}".`,
            tenantId: survey.tenantId,
            userId: null // Client action
        });
    }

    // Lógica para notificação de detratores
    (async () => {
      try {
        console.log("submitSurveyResponses: Checking for detractor responses");
        const tenant = await Tenant.findByPk(survey.tenantId);
        if (!tenant || !tenant.reportPhoneNumber) {
          console.log("submitSurveyResponses: No report phone number for tenant, skipping detractor notification");
          return;
        }

        for (const res of responsesToCreate) {
          const question = questionsMap.get(res.perguntaId);
          let isDetractor = false;

          if (question.type === 'rating_0_10' && res.ratingValue >= 0 && res.ratingValue <= 6) {
            isDetractor = true;
          } else if (question.type === 'rating_1_5' && res.ratingValue >= 1 && res.ratingValue <= 3) {
            isDetractor = true;
          }

          if (isDetractor) {
            console.log("submitSurveyResponses: Detractor response found, sending notification");
            const detractorResponse = {
              ...res,
              pesquisa: { title: survey.title },
            };
            await whatsappService.sendInstanteDetractorMessage(tenant, detractorResponse);

            // --- DETRACTOR NOTIFICATION ---
            if (io) {
                console.log("submitSurveyResponses: Sending real-time notification for detractor response");
                const notificationService = require('../services/NotificationService');
                notificationService.createNotification(io, {
                    type: 'DETRACTOR_RESPONSE',
                    message: `Resposta de detrator na pesquisa "${survey.title}".`,
                    tenantId: survey.tenantId,
                    userId: null
                });
            }
            break; 
          }
        }
      } catch (error) {
        console.error('submitSurveyResponses: Error sending detractor notification:', error);
      }
    })();

    console.log("submitSurveyResponses: Submission process finished successfully");
    return { respondentSessionId: respondentSessionId };
  } catch (error) {
    console.error('submitSurveyResponses: An error occurred. Rolling back transaction.', error);
    await transaction.rollback();
    console.log("submitSurveyResponses: Transaction rolled back");
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
