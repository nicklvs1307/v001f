const asyncHandler = require("express-async-handler");
const atendenteMetaService = require("../services/atendenteMetaService");
const ApiError = require("../errors/ApiError");
const { validateTenantAccess } = require("../utils/tenantUtils");

const VALID_PERIODS = ["DIARIO", "SEMANAL", "MENSAL"];

const atendenteMetaController = {
  // @desc    Cria ou atualiza a meta de um atendente
  // @route   POST /api/atendentes/:atendenteId/metas
  // @access  Private (Super Admin, Admin)
  createOrUpdateMeta: asyncHandler(async (req, res) => {
    const { atendenteId } = req.params;
    const {
      npsGoal,
      responsesGoal,
      registrationsGoal,
      period,
      dias_trabalhados,
      nps_premio_valor,
      respostas_premio_valor,
      cadastros_premio_valor,
    } = req.body;

    if (!atendenteId) {
      throw new ApiError(400, "ID do atendente é obrigatório.");
    }

    if (period && !VALID_PERIODS.includes(period)) {
      throw new ApiError(
        400,
        `Período inválido. Valores aceitos: ${VALID_PERIODS.join(", ")}`,
      );
    }

    const tenantId = validateTenantAccess(req.user, req.body.tenantId);

    if (!tenantId) {
      throw new ApiError(400, "Tenant ID é obrigatório para definir metas.");
    }

    const metaData = {
      npsGoal,
      responsesGoal,
      registrationsGoal,
      period: period || "MENSAL",
      dias_trabalhados,
      nps_premio_valor,
      respostas_premio_valor,
      cadastros_premio_valor,
    };

    const meta = await atendenteMetaService.createOrUpdateMeta(
      atendenteId,
      tenantId,
      metaData,
    );

    res
      .status(200)
      .json({ message: "Meta do atendente salva com sucesso!", meta });
  }),

  // @desc    Obtém a meta de um atendente específico
  // @route   GET /api/atendentes/:atendenteId/metas
  // @access  Private (Super Admin, Admin)
  getMetaByAtendenteId: asyncHandler(async (req, res) => {
    const { atendenteId } = req.params;

    const tenantId = validateTenantAccess(req.user, req.query.tenantId);

    if (!tenantId) {
      throw new ApiError(400, "Tenant ID é obrigatório para buscar metas.");
    }

    const meta = await atendenteMetaService.getMetaByAtendenteId(
      atendenteId,
      tenantId,
    );

    // Nota: Se não tiver meta, retorna null ou erro? O frontend espera objeto ou 404?
    // O código anterior retornava 404. Vamos manter, mas é discutível.
    if (!meta) {
      // throw new ApiError(404, "Meta do atendente não encontrada.");
      // Mudar para retornar objeto vazio ou null para facilitar o frontend (sem erro 404 vermelho)
      return res.status(200).json(null);
    }

    res.status(200).json(meta);
  }),

  // @desc    Obtém todas as metas de atendentes de um tenant
  // @route   GET /api/atendentes/metas
  // @access  Private (Super Admin, Admin)
  getAllMetasByTenant: asyncHandler(async (req, res) => {
    const tenantId = validateTenantAccess(req.user, req.query.tenantId);

    if (!tenantId) {
      throw new ApiError(400, "Tenant ID é obrigatório para buscar metas.");
    }

    const metas = await atendenteMetaService.getAllMetasByTenant(tenantId);
    res.status(200).json(metas);
  }),

  // @desc    Deleta a meta de um atendente
  // @route   DELETE /api/atendentes/:atendenteId/metas
  // @access  Private (Super Admin, Admin)
  deleteMeta: asyncHandler(async (req, res) => {
    const { atendenteId } = req.params;

    const tenantId = validateTenantAccess(req.user, req.query.tenantId);

    if (!tenantId) {
      throw new ApiError(400, "Tenant ID é obrigatório para deletar metas.");
    }

    const deletedRows = await atendenteMetaService.deleteMeta(
      atendenteId,
      tenantId,
    );

    if (deletedRows === 0) {
      throw new ApiError(404, "Meta do atendente não encontrada para deleção.");
    }

    res
      .status(200)
      .json({ message: "Meta do atendente deletada com sucesso." });
  }),
};

module.exports = atendenteMetaController;
