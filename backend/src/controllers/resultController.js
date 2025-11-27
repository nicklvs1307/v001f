const asyncHandler = require("express-async-handler");
const resultRepository = require("../repositories/resultRepository");
const resultService = require("../services/resultService");
const ApiError = require("../errors/ApiError");

// @desc    Obter resultados agregados de uma pesquisa
// @route   GET /api/surveys/:id/results
// @access  Private (Super Admin, Admin, Survey Creator, Survey Viewer)
exports.getSurveyResults = asyncHandler(async (req, res) => {
  const { id } = req.params; // ID da pesquisa
  const requestingUser = req.user;
  const tenantId =
    requestingUser.role === "Super Admin" ? null : requestingUser.tenantId;

  // 1. Obter detalhes da pesquisa para verificação de permissão
  const survey = await resultRepository.getSurveyDetails(id, tenantId);

  // Verificar se a pesquisa existe
  if (!survey) {
    throw new ApiError(404, "Pesquisa não encontrada.");
  }

  // Super Admin pode ver qualquer resultado
  // Outros usuários só podem ver resultados de pesquisas do seu próprio tenant
  if (
    requestingUser.role !== "Super Admin" &&
    survey.tenantId !== requestingUser.tenantId
  ) {
    throw new ApiError(
      403,
      "Você não tem permissão para ver os resultados desta pesquisa.",
    );
  }

  // 2. Chamar o serviço para obter os resultados agregados
  const aggregatedResults = await resultService.aggregateSurveyResults(
    id,
    tenantId,
  );

  // 3. Combinar detalhes da pesquisa com os resultados e enviar a resposta
  res.status(200).json({
    surveyId: survey.id,
    surveyTitle: survey.title,
    surveyDescription: survey.description,
    ...aggregatedResults,
  });
});
