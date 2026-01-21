const asyncHandler = require("express-async-handler");
const atendenteService = require("../services/atendenteService");
const ApiError = require("../errors/ApiError");
const { validateTenantAccess, checkResourceTenant } = require("../utils/tenantUtils");

const atendenteController = {
  createAtendente: asyncHandler(async (req, res) => {
    const { name, status } = req.body;
    
    const targetTenantId = validateTenantAccess(req.user, req.body.tenantId);

    if (!targetTenantId) {
      throw new ApiError(400, "Tenant ID é obrigatório para criar um atendente.");
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
    // Para listar, se for Super Admin sem tenantId específico, lista todos (null).
    // Se for user comum, lista só do seu tenant.
    const isSuperAdmin = req.user.role.name === "Super Admin";
    const tenantId = isSuperAdmin ? req.query.tenantId || null : req.user.tenantId;

    const atendentes = await atendenteService.getAllAtendentes(tenantId);
    res.status(200).json(atendentes);
  }),

  getAtendenteById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Busca inicial (o serviço já pode filtrar por tenantId se passarmos, mas vamos verificar o recurso depois)
    const atendente = await atendenteService.getAtendenteById(id);

    checkResourceTenant(atendente, req.user);

    res.status(200).json(atendente);
  }),

  updateAtendente: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    const existingAtendente = await atendenteService.getAtendenteById(id);
    checkResourceTenant(existingAtendente, req.user);

    const updatedAtendente = await atendenteService.updateAtendente(
      id,
      existingAtendente.tenantId,
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

    const existingAtendente = await atendenteService.getAtendenteById(id);
    checkResourceTenant(existingAtendente, req.user);

    await atendenteService.deleteAtendente(id, existingAtendente.tenantId);

    res.status(200).json({ message: "Atendente deletado com sucesso." });
  }),

  getAtendentePremiacoes: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const atendente = await atendenteService.getAtendenteById(id);
    checkResourceTenant(atendente, req.user);
    
    const premiacoes = await atendenteService.getAtendentePremiacoes(id, atendente.tenantId);

    res.status(200).json(premiacoes);
  }),

  getAtendentePerformance: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const atendente = await atendenteService.getAtendenteById(id);
    checkResourceTenant(atendente, req.user);

    const performance = await atendenteService.getAtendentePerformance(id, atendente.tenantId);

    res.status(200).json(performance);
  }),
};

module.exports = atendenteController;
