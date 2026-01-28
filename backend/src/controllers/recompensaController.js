const asyncHandler = require("express-async-handler");
const recompensaRepository = require("../repositories/recompensaRepository");
const ApiError = require("../errors/ApiError");

const recompensaController = {
  createRecompensa: asyncHandler(async (req, res) => {
    const { name, description, pointsRequired, active } = req.body;
    const requestingUser = req.user;

    const targetTenantId =
      requestingUser.role === "Super Admin" && req.body.tenantId
        ? req.body.tenantId
        : requestingUser.tenantId;

    if (!targetTenantId) {
      throw new ApiError(
        400,
        "Tenant ID é obrigatório para criar uma recompensa.",
      );
    }

    // Lógica revertida para passar argumentos individuais
    const newRecompensa = await recompensaRepository.createRecompensa(
      targetTenantId,
      name,
      description,
      pointsRequired,
      active,
    );

    res.status(201).json(newRecompensa);
  }),

  getAllRecompensas: asyncHandler(async (req, res) => {
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role === "Super Admin" ? null : requestingUser.tenantId;
    const { active } = req.query;

    const activeFilter =
      active === "true" ? true : active === "false" ? false : null;

    const recompensas = await recompensaRepository.getAllRecompensas(
      tenantId,
      activeFilter,
    );
    res.status(200).json(recompensas);
  }),

  getRecompensaById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role === "Super Admin" ? null : requestingUser.tenantId;

    // O nome correto da função no repositório original era findById
    const recompensa = await recompensaRepository.findById(id, tenantId);

    if (!recompensa) {
      throw new ApiError(404, "Recompensa não encontrada.");
    }

    if (
      requestingUser.role !== "Super Admin" &&
      recompensa.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(
        403,
        "Você não tem permissão para ver esta recompensa.",
      );
    }

    res.status(200).json(recompensa);
  }),

  updateRecompensa: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, pointsRequired, active } = req.body;
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role === "Super Admin" ? null : requestingUser.tenantId;

    const existingRecompensa = await recompensaRepository.findById(
      id,
      tenantId,
    );
    if (!existingRecompensa) {
      throw new ApiError(404, "Recompensa não encontrada.");
    }

    if (
      requestingUser.role !== "Super Admin" &&
      existingRecompensa.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(
        403,
        "Você não tem permissão para atualizar esta recompensa.",
      );
    }

    // Lógica revertida para passar argumentos individuais
    const updatedRecompensa = await recompensaRepository.updateRecompensa(
      id,
      existingRecompensa.tenantId,
      name,
      description,
      pointsRequired,
      active,
    );

    if (!updatedRecompensa) {
      throw new ApiError(404, "Recompensa não encontrada para atualização.");
    }

    res.status(200).json({
      message: "Recompensa atualizada com sucesso!",
      recompensa: updatedRecompensa,
    });
  }),

  deleteRecompensa: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role === "Super Admin" ? null : requestingUser.tenantId;

    const existingRecompensa = await recompensaRepository.findById(
      id,
      tenantId,
    );
    if (!existingRecompensa) {
      throw new ApiError(404, "Recompensa não encontrada para deleção.");
    }

    if (
      requestingUser.role !== "Super Admin" &&
      existingRecompensa.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(
        403,
        "Você não tem permissão para deletar esta recompensa.",
      );
    }

    await recompensaRepository.deleteRecompensa(
      id,
      existingRecompensa.tenantId,
    );

    res.status(200).json({ message: "Recompensa deletada com sucesso." });
  }),

  getDashboard: asyncHandler(async (req, res) => {
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role === "Super Admin" ? null : requestingUser.tenantId;
    const dashboardData = await recompensaRepository.getDashboardData(tenantId);
    res.status(200).json(dashboardData);
  }),
};

module.exports = recompensaController;
