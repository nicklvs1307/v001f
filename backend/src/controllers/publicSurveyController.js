const asyncHandler = require("express-async-handler");
const publicSurveyRepository = require("../repositories/publicSurveyRepository");
const clientRepository = require("../repositories/clientRepository");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../errors/ApiError");
const { nowUTC, isWithinOperatingHours } = require("../utils/dateUtils");

const getPublicSurveyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const survey = await publicSurveyRepository.getPublicSurveyById(id);
  if (!survey) {
    throw new ApiError(404, "Pesquisa não encontrada.");
  }

  // Verificar se o link está expirado
  if (survey.isLinkExpirable && survey.linkExpiresAt) {
    const expirationDate = new Date(survey.linkExpiresAt);
    if (nowUTC() > expirationDate) {
      const { formatInTimeZone } = require("../utils/dateUtils");
      const formattedDate = formatInTimeZone(expirationDate, "dd/MM/yyyy HH:mm");
      throw new ApiError(
        410,
        `Este link de pesquisa expirou em ${formattedDate}.`,
      );
    }
  }

  // Verificar horários de funcionamento
  if (!isWithinOperatingHours(survey.operatingHours)) {
    throw new ApiError(
      403,
      "Esta pesquisa não está disponível no momento devido ao horário de funcionamento.",
    );
  }

  res.json(survey);
});

const getPublicAtendentesByTenant = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  const atendentes =
    await publicSurveyRepository.getAtendentesByTenantId(tenantId);
  res.json(atendentes);
});

const getPublicTenantById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenant = await publicSurveyRepository.getPublicTenantById(id);
  if (!tenant) {
    throw new ApiError(404, "Tenant não encontrado.");
  }
  res.json(tenant);
});

const submitSurveyResponses = asyncHandler(async (req, res) => {
  const { id: surveyId } = req.params;
  const { respostas, atendenteId, client } = req.body;

  let currentClient = null;
  let currentRespondentSessionId = uuidv4(); // Default to new UUID for anonymous

  const survey = await publicSurveyRepository.getPublicSurveyById(surveyId);
  if (!survey) {
    throw new ApiError(404, "Pesquisa não encontrada.");
  }

  // Verificar se o link está expirado antes de aceitar respostas
  if (survey.isLinkExpirable && survey.linkExpiresAt) {
    const expirationDate = new Date(survey.linkExpiresAt);
    if (nowUTC() > expirationDate) {
      const { formatInTimeZone } = require("../utils/dateUtils");
      const formattedDate = formatInTimeZone(expirationDate, "dd/MM/yyyy HH:mm");
      throw new ApiError(
        410,
        `Este link de pesquisa expirou em ${formattedDate}.`,
      );
    }
  }

  // Verificar horários de funcionamento antes de aceitar respostas
  if (!isWithinOperatingHours(survey.operatingHours)) {
    throw new ApiError(
      403,
      "Esta pesquisa não está disponível no momento devido ao horário de funcionamento.",
    );
  }

  const tenantId = survey.tenantId;

  if (client && (client.phone || client.email || client.cpf)) {
    let existingClient = null;
    
    // Prioridade 1: CPF
    if (client.cpf) {
      existingClient = await clientRepository.findClientByCpf(
        client.cpf,
        tenantId,
      );
    }
    
    // Prioridade 2: Telefone (se não encontrou por CPF)
    if (!existingClient && client.phone) {
      existingClient = await clientRepository.findClientByPhone(
        client.phone,
        tenantId,
      );
    }
    
    // Prioridade 3: Email
    if (!existingClient && client.email) {
      existingClient = await clientRepository.findClientByEmail(
        client.email,
        tenantId,
      );
    }

    if (existingClient) {
      currentClient = existingClient;
      currentRespondentSessionId =
        existingClient.respondentSessionId || uuidv4();
      
      // Atualizar dados que podem estar faltando
      const updateData = {};
      if (!existingClient.respondentSessionId) {
        updateData.respondentSessionId = currentRespondentSessionId;
      }
      if (!existingClient.cpf && client.cpf) {
        updateData.cpf = client.cpf;
      }
      if (!existingClient.phone && client.phone) {
        updateData.phone = client.phone;
      }

      if (Object.keys(updateData).length > 0) {
        await clientRepository.updateClient(
          existingClient.id,
          updateData,
          tenantId,
        );
      }
    } else {
      // Create new client if not found
      currentClient = await clientRepository.createClient({
        ...client,
        tenantId,
        respondentSessionId: currentRespondentSessionId,
      });
    }

    // Verificar limite de respostas
    if (survey.responseLimit > 0 && currentClient) {
      const responseCount = await publicSurveyRepository.countResponsesByClient(
        survey.id,
        currentClient.id,
      );
      if (responseCount >= survey.responseLimit) {
        throw new ApiError(
          403,
          `Você já atingiu o limite de ${survey.responseLimit} participações permitido para esta pesquisa.`,
        );
      }
    }
  }

  const result = await publicSurveyRepository.submitSurveyResponses(
    surveyId,
    respostas,
    currentRespondentSessionId,
    currentClient ? currentClient.id : null,
    atendenteId,
    req.app.get("io"),
  );
  res.status(201).json(result);
});

const submitSurveyWithClient = asyncHandler(async (req, res) => {
  const { surveyId, respondentSessionId, client } = req.body;

  if (!respondentSessionId || !client || (!client.phone && !client.cpf)) {
    throw new ApiError(400, "Dados insuficientes para confirmar o cliente.");
  }

  // Obter o tenantId a partir do surveyId
  const survey = await publicSurveyRepository.getPublicSurveyById(surveyId);
  if (!survey) {
    throw new ApiError(404, "Pesquisa não encontrada.");
  }
  const tenantId = survey.tenantId;

  let existingClient = null;

  if (client.cpf) {
    existingClient = await clientRepository.findClientByCpf(
      client.cpf,
      tenantId,
    );
  }

  if (!existingClient && client.phone) {
    existingClient = await clientRepository.findClientByPhone(
      client.phone,
      tenantId,
    );
  }

  if (!existingClient && client.email) {
    existingClient = await clientRepository.findClientByEmail(
      client.email,
      tenantId,
    );
  }

  if (!existingClient) {
    throw new ApiError(
      404,
      "Cliente não encontrado com os dados fornecidos.",
    );
  }

  // Verificar limite de respostas
  if (survey.responseLimit > 0) {
    const responseCount = await publicSurveyRepository.countResponsesByClient(
      survey.id,
      existingClient.id,
    );
    if (responseCount >= survey.responseLimit) {
      throw new ApiError(
        403,
        `Você já atingiu o limite de ${survey.responseLimit} participações permitido para esta pesquisa.`,
      );
    }
  }

  // Atualiza dados do cliente se estiverem vazios
  const updateData = {};
  if (!existingClient.respondentSessionId) {
    updateData.respondentSessionId = respondentSessionId;
  }
  if (!existingClient.cpf && client.cpf) {
    updateData.cpf = client.cpf;
  }
  if (!existingClient.phone && client.phone) {
    updateData.phone = client.phone;
  }

  if (Object.keys(updateData).length > 0) {
    await clientRepository.updateClient(
      existingClient.id,
      updateData,
      tenantId,
    );
  }

  // Vincula as respostas que foram enviadas anteriormente de forma anônima
  await publicSurveyRepository.linkResponsesToClient(
    respondentSessionId,
    existingClient.id,
  );

  res.status(200).json({
    message: "Identidade confirmada e respostas vinculadas com sucesso!",
    clienteId: existingClient.id,
    respondentSessionId: respondentSessionId,
  });
});

module.exports = {
  getPublicSurveyById,
  getPublicAtendentesByTenant,
  getPublicTenantById,
  submitSurveyResponses,
  submitSurveyWithClient,
};
