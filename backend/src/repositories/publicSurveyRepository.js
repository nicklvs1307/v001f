const models = require("../../models");
const whatsappService = require("../services/whatsappService");
const { sequelize } = require("../database"); // Importa a instância do Sequelize para transações
const ApiError = require("../errors/ApiError"); // Importar ApiError para validações
const { v4: uuidv4 } = require("uuid"); // Adicionar import do uuid
const { now } = require("../utils/dateUtils"); // Importar now

const getAtendentesByTenantId = async (tenantId) => {
  const atendentes = await models.Atendente.findAll({
    where: {
      tenantId,
      status: "active", // Apenas atendentes ativos
    },
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });
  return atendentes;
};

const getPublicSurveyById = async (id) => {
  const survey = await models.Pesquisa.findByPk(id, {
    attributes: [
      "id",
      "title",
      "description",
      "createdAt",
      "updatedAt",
      "isOpen",
      "tenantId",
      "askForAttendant",
      "status",
      "recompensaId",
      "roletaId",
    ], // Adicionar 'status', 'recompensaId', 'roletaId'
    include: [
      {
        model: models.Pergunta,
        as: "perguntas", // Certifique-se de que 'as' corresponde à associação definida no modelo Pesquisa
        attributes: ["id", "type", "text", "options", "order", "required"], // Adicionar 'required'
        order: [["order", "ASC"]],
      },
      {
        model: models.Tenant, // Incluir o modelo Tenant
        as: "tenant", // Usar 'as' se houver uma associação definida no modelo Pesquisa
        attributes: [
          "name",
          "logoUrl",
          "description",
          "primaryColor",
          "secondaryColor",
        ], // Selecionar os atributos desejados do Tenant
        required: false, // Adicionar para fazer um LEFT JOIN
      },
      {
        model: models.Roleta, // Incluir o modelo Roleta
        as: "roleta", // Usar 'as' se houver uma associação definida no modelo Pesquisa
        attributes: ["id", "nome", "descricao", "active"], // Selecionar os atributos desejados da Roleta
        required: false, // Adicionar para fazer um LEFT JOIN
      },
    ],
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
    roleta: survey.roleta
      ? {
          id: survey.roleta.id,
          nome: survey.roleta.nome,
          descricao: survey.roleta.descricao,
          active: survey.roleta.active,
        }
      : null,
    questions: survey.perguntas.map((question) => {
      let parsedOptions = question.options;
      if (typeof question.options === "string") {
        try {
          parsedOptions = JSON.parse(question.options);
        } catch (e) {
          console.error(
            "Failed to parse question options:",
            question.options,
            e,
          );
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

const submitSurveyResponses = async (
  surveyId,
  responses,
  respondentSessionId,
  clienteId,
  atendenteId,
  io,
) => {
  const transaction = await sequelize.transaction();
  try {
    const survey = await models.Pesquisa.findByPk(surveyId, {
      attributes: ["isOpen", "tenantId", "askForAttendant", "title"],
      include: [
        {
          model: models.Pergunta,
          as: "perguntas",
          attributes: ["id", "type", "options", "required", "text"],
        },
      ],
      transaction,
    });

    if (!survey) {
      console.error("submitSurveyResponses: Survey not found");
      throw new ApiError(404, "Pesquisa não encontrada.");
    }

    if (!survey.isOpen) {
      console.error("submitSurveyResponses: Survey is not open");
      throw new ApiError(
        403,
        "Esta pesquisa não está aberta para novas respostas.",
      );
    }

    const questionsMap = new Map(survey.perguntas.map((q) => [q.id, q]));

    const finalAtendenteId = atendenteId === "" ? null : atendenteId;

    const responsesToCreate = [];
    for (const res of responses) {
      const question = questionsMap.get(res.perguntaId);

      if (!question) {
        console.error(
          `submitSurveyResponses: Question with ID ${res.perguntaId} not found`,
        );
        throw new ApiError(
          400,
          `Pergunta com ID ${res.perguntaId} não encontrada na pesquisa.`,
        );
      }

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
        case "rating_1_5":
        case "rating_0_10":
          responseData.ratingValue = res.valor;
          break;
        case "free_text":
          responseData.textValue = res.valor;
          break;
        case "multiple_choice":
        case "checkbox":
          if (res.valor) {
            const valueAsArray = Array.isArray(res.valor)
              ? res.valor
              : [res.valor];
            responseData.selectedOption = JSON.stringify(valueAsArray);
          } else {
            responseData.selectedOption = null;
          }
          break;
        default:
          continue;
      }

      if (
        question.required &&
        (res.valor === undefined || res.valor === null || res.valor === "")
      ) {
        console.error(
          `submitSurveyResponses: Required question "${question.text}" is missing a value`,
        );
        throw new ApiError(400, `A pergunta "${question.text}" é obrigatória.`);
      }

      responsesToCreate.push(responseData);
    }

    await models.Resposta.bulkCreate(responsesToCreate, { transaction });

    await transaction.commit();

    // Lógica para verificar nota máxima e retornar link do GMB
    let gmb_link = null;
    try {
      const ratingQuestions = survey.perguntas.filter(
        (p) => p.type === "rating_1_5" || p.type === "rating_0_10",
      );
      const allMaxScore = ratingQuestions.every((q) => {
        const response = responses.find((r) => r.perguntaId === q.id);
        if (!response) return false; // Se não houver resposta para uma pergunta de nota, não é nota máxima

        if (q.type === "rating_1_5") {
          return response.valor === 5;
        }
        if (q.type === "rating_0_10") {
          return response.valor === 10;
        }
        return false;
      });

      if (ratingQuestions.length > 0 && allMaxScore) {
        const tenant = await models.Tenant.findByPk(survey.tenantId, {
          attributes: ["gmb_link"],
        });
        if (tenant && tenant.gmb_link) {
          gmb_link = tenant.gmb_link;
        }
      }
    } catch (error) {
      console.error(
        "submitSurveyResponses: Error checking for max score or fetching GMB link:",
        error,
      );
      // Não quebrar a execução principal se essa lógica falhar
    }

    // Lógica para notificação de detratores e envio para cliente
    (async () => {
      try {
        const whatsappConfig = await models.WhatsappConfig.findOne({
          where: { tenantId: survey.tenantId },
        });

        // Se não houver configuração, não há nada a fazer.
        if (!whatsappConfig) return;

        const client = clienteId
          ? await models.Client.findByPk(clienteId)
          : null;

        for (const res of responsesToCreate) {
          const question = questionsMap.get(res.perguntaId);
          let isDetractor = false;

          if (
            question.type === "rating_0_10" &&
            res.ratingValue >= 0 &&
            res.ratingValue <= 6
          ) {
            isDetractor = true;
          } else if (
            question.type === "rating_1_5" &&
            res.ratingValue >= 1 &&
            res.ratingValue <= 3
          ) {
            isDetractor = true;
          }

          if (isDetractor) {
            // Ação 1: Notificar a equipe/administradores
            if (
              whatsappConfig.dailyReportEnabled &&
              whatsappConfig.reportPhoneNumbers
            ) {
              const numbersToNotify = whatsappConfig.reportPhoneNumbers
                .split(",")
                .map((n) => n.trim())
                .filter((n) => n);
              const messageToAdmin = `
*Alerta de Detrator!* 😡
Um cliente deu uma nota baixa na pesquisa "${survey.title}".
- *Nota:* ${res.ratingValue}
- *Comentário:* ${res.textValue || "Nenhum comentário."}
- *Cliente:* ${client ? client.name : "Não identificado"}
              `.trim();

              for (const number of numbersToNotify) {
                try {
                  await whatsappService.sendTenantMessage(
                    survey.tenantId,
                    number,
                    messageToAdmin,
                  );
                } catch (adminError) {
                  console.error(
                    `Falha ao enviar notificação de detrator para o admin ${number}:`,
                    adminError,
                  );
                }
              }
            }

            // Ação 2: Enviar mensagem para o cliente detrator
            if (
              whatsappConfig.sendDetractorMessageToClient &&
              client &&
              client.phone
            ) {
              let messageToClient =
                whatsappConfig.detractorMessageTemplate ||
                "Olá, {{cliente}}. Vimos que você teve um problema conosco e gostaríamos de entender melhor. Podemos ajudar de alguma forma?";
              messageToClient = messageToClient.replace(
                "{{cliente}}",
                client.name.split(" ")[0],
              );

              try {
                await whatsappService.sendTenantMessage(
                  survey.tenantId,
                  client.phone,
                  messageToClient,
                );
              } catch (clientError) {
                console.error(
                  `Falha ao enviar mensagem para o cliente detrator ${client.phone}:`,
                  clientError,
                );
              }
            }

            break; // Parar após encontrar o primeiro detrator e processar as ações
          }
        }
      } catch (error) {
        console.error(
          "submitSurveyResponses: Error in detractor notification logic:",
          error,
        );
      }
    })();

    return { respondentSessionId: respondentSessionId, gmb_link: gmb_link };
  } catch (error) {
    console.error(
      "submitSurveyResponses: An error occurred. Rolling back transaction.",
      error,
    );
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

const findTenantIdBySession = async (respondentSessionId) => {
  const response = await models.Resposta.findOne({
    where: { respondentSessionId },
    attributes: ["tenantId"],
  });
  return response ? response.tenantId : null;
};

const linkResponsesToClient = async (
  respondentSessionId,
  clienteId,
  transaction,
) => {
  await models.Resposta.update(
    { clienteId },
    { where: { respondentSessionId, clienteId: null }, transaction },
  );

  // Find one response to get the surveyId and tenantId
  const response = await models.Resposta.findOne({
    where: { respondentSessionId },
    attributes: ["pesquisaId", "tenantId"],
    transaction,
  });

  if (response && response.pesquisaId) {
    const { pesquisaId, tenantId } = response;

    const survey = await models.Pesquisa.findByPk(pesquisaId, {
      attributes: ["recompensaId"],
      transaction,
    });

    if (survey && survey.recompensaId) {
      // Check if a coupon already exists for this client and survey
      const existingCoupon = await models.Cupom.findOne({
        where: {
          clienteId: clienteId,
          pesquisaId: pesquisaId,
        },
        transaction,
      });

      if (!existingCoupon) {
        const codigo = uuidv4().substring(0, 8).toUpperCase();
        const dataGeracao = now();
        const dataValidade = now();
        dataValidade.setDate(dataValidade.getDate() + 30); // Set expiration to 30 days

        const cupomData = {
          tenantId: tenantId,
          recompensaId: survey.recompensaId,
          pesquisaId: pesquisaId,
          clienteId: clienteId,
          codigo: codigo,
          dataGeracao: dataGeracao,
          dataValidade: dataValidade,
          status: "active",
        };

        await models.Cupom.create(cupomData, { transaction });
      } else {
      }
    }
  }
  // END: Coupon Generation Logic
};

const getPublicTenantById = async (id) => {
  const tenant = await models.Tenant.findByPk(id, {
    attributes: [
      "id",
      "name",
      "logoUrl",
      "primaryColor",
      "secondaryColor",
      "description",
    ],
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
