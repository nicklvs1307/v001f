const publicSurveyRepository = require("../repositories/publicSurveyRepository");
const clientRepository = require("../repositories/clientRepository");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../errors/ApiError");

const getPublicSurveyById = async (req, res) => {
  const { id } = req.params;
  const survey = await publicSurveyRepository.getPublicSurveyById(id);
  if (!survey) {
    throw new ApiError(404, "Pesquisa não encontrada.");
  }
  res.json(survey);
};

const getPublicAtendentesByTenant = async (req, res) => {
  const { tenantId } = req.params;
  const atendentes = await publicSurveyRepository.getAtendentesByTenantId(tenantId);
  res.json(atendentes);
};

const getPublicTenantById = async (req, res) => {
  // Esta função pode precisar ser implementada no repositório se não existir
  const { id } = req.params;
  // Supondo que exista uma função no repositório para buscar tenant
  const tenant = await publicSurveyRepository.getPublicTenantById(id); 
  if (!tenant) {
    throw new ApiError(404, "Tenant não encontrado.");
  }
  res.json(tenant);
};

const submitSurveyResponses = async (req, res) => {
  const { id } = req.params;
  const { respostas, atendenteId } = req.body;
  const respondentSessionId = uuidv4();

  const result = await publicSurveyRepository.submitSurveyResponses(
    id,
    respostas,
    respondentSessionId,
    null, // clienteId é nulo inicialmente
    atendenteId
  );
  res.status(201).json(result);
};

const submitSurveyWithClient = async (req, res) => {
  const { surveyId, respostas, atendenteId, client } = req.body;

  if (!surveyId || !respostas || !client || !client.phone) {
    throw new ApiError(400, "Dados insuficientes para submeter a pesquisa.");
  }

  const existingClient = await clientRepository.findClientByPhone(client.phone);
  if (!existingClient) {
    throw new ApiError(404, "Cliente não encontrado com o telefone fornecido.");
  }

  const respondentSessionId = uuidv4();

  await publicSurveyRepository.submitSurveyResponses(
    surveyId,
    respostas,
    respondentSessionId,
    existingClient.id,
    atendenteId
  );

  res.status(201).json({
    message: "Respostas enviadas com sucesso!",
    clienteId: existingClient.id,
    respondentSessionId,
  });
};

module.exports = {
  getPublicSurveyById,
  getPublicAtendentesByTenant,
  getPublicTenantById,
  submitSurveyResponses,
  submitSurveyWithClient,
};