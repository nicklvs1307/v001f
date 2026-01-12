const asyncHandler = require("express-async-handler");
const publicSurveyRepository = require("../repositories/publicSurveyRepository");
const clientRepository = require("../repositories/clientRepository");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../errors/ApiError");

const getPublicSurveyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const survey = await publicSurveyRepository.getPublicSurveyById(id);
  if (!survey) {
    throw new ApiError(404, "Pesquisa não encontrada.");
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
  const tenantId = survey.tenantId;

  if (client && (client.phone || client.email)) {
    let existingClient = null;
    if (client.phone) {
      existingClient = await clientRepository.findClientByPhone(client.phone, tenantId);
    }
    if (!existingClient && client.email) {
      existingClient = await clientRepository.findClientByEmail(client.email, tenantId);
    }

    if (existingClient) {
      currentClient = existingClient;
      currentRespondentSessionId = existingClient.respondentSessionId || uuidv4();
      if (!existingClient.respondentSessionId) {
        await clientRepository.updateClient(existingClient.id, { respondentSessionId: currentRespondentSessionId }, tenantId);
      }
    } else {
      // Create new client if not found
      currentClient = await clientRepository.createClient({
        ...client,
        tenantId,
        respondentSessionId: currentRespondentSessionId,
      });
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
  const { surveyId, respostas, atendenteId, client } = req.body;

  if (!surveyId || !respostas || !client || !client.phone) {
    throw new ApiError(400, "Dados insuficientes para submeter a pesquisa.");
  }

  // Obter o tenantId a partir do surveyId
  const survey = await publicSurveyRepository.getPublicSurveyById(surveyId);
  if (!survey) {
    throw new ApiError(404, "Pesquisa não encontrada.");
  }
  const tenantId = survey.tenantId;

  let existingClient = await clientRepository.findClientByPhone(
    client.phone,
    tenantId,
  );
  // If client not found by phone, check by email
  if (!existingClient && client.email) {
    existingClient = await clientRepository.findClientByEmail(client.email, tenantId);
  }

  if (!existingClient) {
    throw new ApiError(404, "Cliente não encontrado com o telefone/email fornecido.");
  }

  // Use existing client's respondentSessionId or generate a new one if it's null
  const currentRespondentSessionId = existingClient.respondentSessionId || uuidv4();
  if (!existingClient.respondentSessionId) {
    await clientRepository.updateClient(existingClient.id, { respondentSessionId: currentRespondentSessionId }, tenantId);
  }

  await publicSurveyRepository.submitSurveyResponses(
    surveyId,
    respostas,
    currentRespondentSessionId, // Use the correct respondentSessionId
    existingClient.id,
    atendenteId,
    req.app.get("io"),
  );

  res.status(201).json({
    message: "Respostas enviadas com sucesso!",
    clienteId: existingClient.id,
    respondentSessionId: currentRespondentSessionId, // Return the used respondentSessionId
  });
});

module.exports = {
  getPublicSurveyById,
  getPublicAtendentesByTenant,
  getPublicTenantById,
  submitSurveyResponses,
  submitSurveyWithClient,
};
