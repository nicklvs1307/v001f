const asyncHandler = require("express-async-handler");
const gmbConfigRepository = require("../repositories/gmbConfigRepository");
const ApiError = require("../errors/ApiError");

const gmbConfigController = {
  // @desc    Cria ou atualiza a configuração GMB para um tenant
  // @route   POST /api/gmb/config
  // @access  Private (Admin, Super Admin)
  createOrUpdateConfig: asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, locationId } = req.body;
    const requestingUser = req.user;

    if (!accessToken || !refreshToken || !locationId) {
      throw new ApiError(400, "Dados de configuração GMB incompletos.");
    }

    const config = await gmbConfigRepository.createOrUpdateConfig(
      requestingUser.tenantId,
      { accessToken, refreshToken, locationId }
    );

    res.status(200).json({ message: "Configuração GMB salva com sucesso!", config });
  }),

  // @desc    Obtém a configuração GMB de um tenant
  // @route   GET /api/gmb/config
  // @access  Private (Admin, Super Admin)
  getConfig: asyncHandler(async (req, res) => {
    const requestingUser = req.user;

    const config = await gmbConfigRepository.getConfigByTenantId(requestingUser.tenantId);

    if (!config) {
      throw new ApiError(404, "Configuração GMB não encontrada para este tenant.");
    }

    res.status(200).json(config);
  }),

  // @desc    Deleta a configuração GMB de um tenant
  // @route   DELETE /api/gmb/config
  // @access  Private (Admin, Super Admin)
  deleteConfig: asyncHandler(async (req, res) => {
    const requestingUser = req.user;

    const deletedRows = await gmbConfigRepository.deleteConfig(requestingUser.tenantId);

    if (deletedRows === 0) {
      throw new ApiError(404, "Configuração GMB não encontrada para deleção.");
    }

    res.status(200).json({ message: "Configuração GMB deletada com sucesso." });
  }),
};

module.exports = gmbConfigController;
