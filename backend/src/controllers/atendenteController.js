const asyncHandler = require("express-async-handler");
const atendenteService = require("../services/atendenteService");
const ApiError = require("../errors/ApiError");
const {
  validateTenantAccess,
  checkResourceTenant,
} = require("../utils/tenantUtils");

const atendenteController = {
  createAtendente: asyncHandler(async (req, res) => {
    const { name, status, phone } = req.body;

    const targetTenantId = validateTenantAccess(req.user, req.body.tenantId);

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
      phone,
    );

    res
      .status(201)
      .json({ message: "Atendente criado com sucesso!", atendente });
  }),

  getAllAtendentes: asyncHandler(async (req, res) => {
    // Para listar, se for Super Admin sem tenantId específico, lista todos (null).
    // Se for user comum, lista só do seu tenant.
    const isSuperAdmin = req.user.role.name === "Super Admin";
    const tenantId = isSuperAdmin
      ? req.query.tenantId || null
      : req.user.tenantId;

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
    const { name, status, phone } = req.body;

    const existingAtendente = await atendenteService.getAtendenteById(id);
    checkResourceTenant(existingAtendente, req.user);

    const updatedAtendente = await atendenteService.updateAtendente(
      id,
      existingAtendente.tenantId,
      name,
      status,
      phone,
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

  sendSurveyLink: asyncHandler(async (req, res) => {
    const { atendenteIds, pesquisaId, all } = req.body;
    const { tenantId } = req.user;

    if (!pesquisaId) {
      throw new ApiError(400, "ID da pesquisa é obrigatório.");
    }

    const survey = await require("../repositories/publicSurveyRepository").getPublicSurveyById(pesquisaId);
    if (!survey) {
      throw new ApiError(404, "Pesquisa não encontrada.");
    }

    let targets = [];
    if (all) {
      targets = await atendenteService.getAllAtendentes(tenantId);
    } else {
      if (!Array.isArray(atendenteIds) || atendenteIds.length === 0) {
        throw new ApiError(400, "IDs dos atendentes são obrigatórios.");
      }
      for (const id of atendenteIds) {
        const atendente = await atendenteService.getAtendenteById(id, tenantId);
        if (atendente) targets.push(atendente);
      }
    }

    const whatsappService = require("../services/whatsappService");
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    let successCount = 0;
    let failCount = 0;

    for (const atendente of targets) {
      if (!atendente.phone) {
        failCount++;
        continue;
      }

      const linkToken = survey.linkToken || survey.id;
      const personalizedLink = `${frontendUrl}/pesquisa/${tenantId}/${linkToken}?atendenteId=${atendente.id}`;
      const message = `Olá ${atendente.name}! Aqui está o seu link/QR Code pessoal para a pesquisa "${survey.title}": ${personalizedLink}`;

      try {
        await whatsappService.sendTenantMessage(tenantId, atendente.phone, message);
        successCount++;
      } catch (error) {
        console.error(`Erro ao enviar para atendente ${atendente.name}:`, error);
        failCount++;
      }
    }

    res.status(200).json({ 
      message: "Processo de envio concluído.",
      results: { total: targets.length, success: successCount, failed: failCount }
    });
  }),

  getAtendentePremiacoes: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const atendente = await atendenteService.getAtendenteById(id);
    checkResourceTenant(atendente, req.user);

    const premiacoes = await atendenteService.getAtendentePremiacoes(
      id,
      atendente.tenantId,
    );

    res.status(200).json(premiacoes);
  }),

  getAtendentePerformance: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const atendente = await atendenteService.getAtendenteById(id);
    checkResourceTenant(atendente, req.user);

    const performance = await atendenteService.getAtendentePerformance(
      id,
      atendente.tenantId,
    );

    res.status(200).json(performance);
  }),

  awardBonus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { valor_premio, descricao_premio, metricValueAchieved, atendenteMetaId } = req.body;
    const { tenantId } = req.user;

    if (!valor_premio || !descricao_premio) {
      throw new ApiError(400, "Valor e descrição do prêmio são obrigatórios.");
    }

    const atendente = await atendenteService.getAtendenteById(id, tenantId);
    if (!atendente) {
      throw new ApiError(404, "Atendente não encontrado.");
    }

    const premiacao = await atendenteService.registerPremiacao({
      atendenteId: id,
      tenantId,
      atendenteMetaId,
      valor_premio,
      descricao_premio,
      metricValueAchieved,
      dateAwarded: new Date()
    });

    res.status(201).json({ message: "Prêmio registrado com sucesso!", premiacao });
  }),
};

module.exports = atendenteController;
