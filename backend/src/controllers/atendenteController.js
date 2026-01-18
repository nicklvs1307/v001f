const asyncHandler = require("express-async-handler");
const atendenteService = require("../services/atendenteService");
const ApiError = require("../errors/ApiError");

const atendenteController = {
  createAtendente: asyncHandler(async (req, res) => {
    const { name, status } = req.body;
    const requestingUser = req.user;

    const targetTenantId =
      requestingUser.role.name === "Super Admin" && req.body.tenantId
        ? req.body.tenantId
        : requestingUser.tenantId;

    if (!targetTenantId) {
      throw new ApiError(
        400,
        "Tenant ID é obrigatório para criar um atendente.",
      );
    }

    const atendente = await atendenteService.createAtendente(
      targetTenantId,
      name,
      status,
    );

    res
      .status(201)
      .json({ message: "Atendente criado com sucesso!", atendente });
  }),

  getAllAtendentes: asyncHandler(async (req, res) => {
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role.name === "Super Admin" ? null : requestingUser.tenantId;

    const atendentes = await atendenteService.getAllAtendentes(tenantId);
    res.status(200).json(atendentes);
  }),

  getAtendenteById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role.name === "Super Admin" ? null : requestingUser.tenantId;

    const atendente = await atendenteService.getAtendenteById(id, tenantId);

    if (!atendente) {
      throw new ApiError(404, "Atendente não encontrado.");
    }

    // A verificação de tenantId já é feita no repositório, mas uma dupla verificação aqui é boa prática
    if (
      requestingUser.role.name !== "Super Admin" &&
      atendente.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(
        403,
        "Você não tem permissão para ver este atendente.",
      );
    }

    res.status(200).json(atendente);
  }),

  updateAtendente: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;
    const requestingUser = req.user;

    // Apenas Super Admin pode especificar um tenantId
    const tenantId =
      requestingUser.role.name === "Super Admin" ? null : requestingUser.tenantId;

    // Primeiro, verifique se o atendente existe e pertence ao tenant do usuário
    const existingAtendente = await atendenteService.getAtendenteById(id, tenantId);
    if (!existingAtendente) {
      throw new ApiError(404, "Atendente não encontrado.");
    }
    
    // Garante que um admin não possa atualizar atendentes de outro tenant
    if (
      requestingUser.role.name !== "Super Admin" &&
      existingAtendente.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(
        403,
        "Você não tem permissão para atualizar este atendente.",
      );
    }

    const updatedAtendente = await atendenteService.updateAtendente(
      id,
      existingAtendente.tenantId, // Use o tenantId do atendente existente para segurança
      name,
      status,
    );

    res.status(200).json({
      message: "Atendente atualizado com sucesso!",
      atendente: updatedAtendente,
    });
  }),

  deleteAtendente: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role.name === "Super Admin" ? null : requestingUser.tenantId;

    const existingAtendente = await atendenteService.getAtendenteById(id, tenantId);
    if (!existingAtendente) {
      throw new ApiError(404, "Atendente não encontrado para deleção.");
    }

    if (
      requestingUser.role.name !== "Super Admin" &&
      existingAtendente.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(
        403,
        "Você não tem permissão para deletar este atendente.",
      );
    }

    await atendenteService.deleteAtendente(id, existingAtendente.tenantId);

    res.status(200).json({ message: "Atendente deletado com sucesso." });
  }),

  getAtendentePremiacoes: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role.name === "Super Admin" ? null : requestingUser.tenantId;

    const atendente = await atendenteService.getAtendenteById(id, tenantId);
    if (!atendente) {
      throw new ApiError(404, "Atendente não encontrado.");
    }
    
    const premiacoes = await atendenteService.getAtendentePremiacoes(id, atendente.tenantId);

    res.status(200).json(premiacoes);
  }),

  getAtendentePerformance: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role.name === "Super Admin" ? null : requestingUser.tenantId;

    const atendente = await atendenteService.getAtendenteById(id, tenantId);
    if (!atendente) {
      throw new ApiError(404, "Atendente não encontrado.");
    }

    const performance = await atendenteService.getAtendentePerformance(id, atendente.tenantId);

    res.status(200).json(performance);
  }),
};

module.exports = atendenteController;
