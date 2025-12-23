const asyncHandler = require("express-async-handler");
const atendenteMetaRepository = require("../repositories/atendenteMetaRepository");
const ApiError = require("../errors/ApiError");

const atendenteMetaController = {
  // @desc    Cria ou atualiza a meta de um atendente
  // @route   POST /api/atendentes/:atendenteId/metas
  // @access  Private (Super Admin, Admin)
  createOrUpdateMeta: asyncHandler(async (req, res) => {
    const { atendenteId } = req.params;
    const { npsGoal, responsesGoal, registrationsGoal, recompensaId, period } = req.body;
    const requestingUser = req.user;

    if (!atendenteId) {
      throw new ApiError(400, "ID do atendente é obrigatório.");
    }

    const tenantId =
      requestingUser.role === "Super Admin"
        ? req.body.tenantId
        : requestingUser.tenantId;

    if (!tenantId) {
      throw new ApiError(400, "Tenant ID é obrigatório para definir metas.");
    }

    const metaData = { npsGoal, responsesGoal, registrationsGoal, recompensaId, period };

    const meta = await atendenteMetaRepository.createOrUpdateMeta(
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
    const requestingUser = req.user;

    const tenantId =
      requestingUser.role === "Super Admin"
        ? req.query.tenantId
        : requestingUser.tenantId;

    if (!tenantId) {
      throw new ApiError(400, "Tenant ID é obrigatório para buscar metas.");
    }

    const meta = await atendenteMetaRepository.getMetaByAtendenteId(
      atendenteId,
      tenantId,
    );

    if (!meta) {
      throw new ApiError(404, "Meta do atendente não encontrada.");
    }

    res.status(200).json(meta);
  }),

  // @desc    Obtém todas as metas de atendentes de um tenant
  // @route   GET /api/atendentes/metas
  // @access  Private (Super Admin, Admin)
  getAllMetasByTenant: asyncHandler(async (req, res) => {
    const requestingUser = req.user;

    const tenantId =
      requestingUser.role === "Super Admin"
        ? req.query.tenantId
        : requestingUser.tenantId;

    if (!tenantId) {
      throw new ApiError(400, "Tenant ID é obrigatório para buscar metas.");
    }

    const metas = await atendenteMetaRepository.getAllMetasByTenant(tenantId);
    res.status(200).json(metas);
  }),

  // @desc    Deleta a meta de um atendente
  // @route   DELETE /api/atendentes/:atendenteId/metas
  // @access  Private (Super Admin, Admin)
  deleteMeta: asyncHandler(async (req, res) => {
    const { atendenteId } = req.params;
    const requestingUser = req.user;

    const tenantId =
      requestingUser.role === "Super Admin"
        ? req.query.tenantId
        : requestingUser.tenantId;

    if (!tenantId) {
      throw new ApiError(400, "Tenant ID é obrigatório para deletar metas.");
    }

    const deletedRows = await atendenteMetaRepository.deleteMeta(
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
