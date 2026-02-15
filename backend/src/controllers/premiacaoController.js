const asyncHandler = require("express-async-handler");
const premiacaoRepository = require("../repositories/premiacaoRepository");
const ApiError = require("../errors/ApiError");

const premiacaoController = {
  // @desc    Obtém todas as premiações concedidas para um tenant
  // @route   GET /api/premiacoes
  // @access  Private (Admin)
  getAllPremiacoes: asyncHandler(async (req, res) => {
    const requestingUser = req.user;

    const tenantId =
      requestingUser.role.name === "Super Admin"
        ? req.query.tenantId // Super Admin pode buscar por tenantId na query
        : requestingUser.tenantId; // Admin só pode buscar do seu próprio tenant

    if (!tenantId) {
      throw new ApiError(
        400,
        "Tenant ID é obrigatório para buscar premiações.",
      );
    }

    const premiacoes = await premiacaoRepository.getAllPremiacoes(tenantId);
    res.status(200).json(premiacoes);
  }),
};

module.exports = premiacaoController;
