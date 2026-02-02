const asyncHandler = require("express-async-handler");
const auditRepository = require("../repositories/auditRepository");
const ApiError = require("../errors/ApiError");

/**
 * @desc    Listar participações em pesquisas (Auditoria)
 * @route   GET /api/audit/surveys
 * @access  Private (Admin)
 */
exports.getSurveyParticipations = asyncHandler(async (req, res) => {
  const { tenantId } = req.user;
  const { page, limit, search } = req.query;

  const data = await auditRepository.findAllAuditSurveys(tenantId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    search: search || ''
  });

  res.status(200).json(data);
});

/**
 * @desc    Obter detalhes de uma participação específica
 * @route   GET /api/audit/surveys/:sessionId
 * @access  Private (Admin)
 */
exports.getParticipationDetails = asyncHandler(async (req, res) => {
  const { tenantId } = req.user;
  const { sessionId } = req.params;

  const details = await auditRepository.getAuditSurveyDetails(sessionId, tenantId);

  if (!details) {
    throw new ApiError(404, "Participação não encontrada.");
  }

  res.status(200).json(details);
});

/**
 * @desc    Cancelar uma participação e invalidar prêmios
 * @route   POST /api/audit/surveys/:sessionId/cancel
 * @access  Private (Admin)
 */
exports.cancelParticipation = asyncHandler(async (req, res) => {
  const { tenantId } = req.user;
  const { sessionId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, "O motivo do cancelamento é obrigatório.");
  }

  await auditRepository.cancelParticipation(sessionId, tenantId, reason);

  res.status(200).json({
    message: "Pesquisa e cupons associados foram cancelados com sucesso."
  });
});
