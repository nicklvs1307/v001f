const asyncHandler = require("express-async-handler");
const { WhatsappTemplate } = require("../../models");
const whatsappConfigRepository = require("../repositories/whatsappConfigRepository");
const recompensaRepository = require("../repositories/recompensaRepository");
const roletaRepository = require("../repositories/roletaRepository");
const tenantRepository = require("../repositories/tenantRepository"); // Importar tenantRepository
const whatsappService = require("../services/whatsappService");
const ApiError = require("../errors/ApiError");
const whatsappWebhookRepository = require("../repositories/whatsappWebhookRepository");

const whatsappConfigController = {
  // --- Rotas para o Tenant Admin ---

  getInstanceConfig: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const config = await whatsappConfigRepository.findByTenant(tenantId);

    const couponReminderTemplate = await WhatsappTemplate.findOne({
      where: { tenantId, type: "COUPON_REMINDER" },
    });

    // Buscar todas as recompensas ativas
    const recompensas = await recompensaRepository.getAllRecompensas(
      tenantId,
      true, // Apenas recompensas ativas
    );

    const roletas = await roletaRepository.findAllByTenant(tenantId);

    if (!config) {
      return res.json({ status: "unconfigured" });
    }

    const currentStatus = await whatsappService.getInstanceStatus(tenantId);

    // Unifica os dados de WhatsappConfig e WhatsappTemplate
    const response = {
      ...config.get({ plain: true }),
      status: currentStatus,
      recompensas, // Adiciona a lista de recompensas
      roletas,
      // Mapeia os dados para a estrutura esperada pelo frontend
      dailyReport: {
        enabled: config.dailyReportEnabled,
        reportPhoneNumbers: config.reportPhoneNumbers,
      },
      prizeRoulette: {
        enabled: config.sendPrizeMessage,
        template: config.prizeMessageTemplate,
      },
      couponReminder: {
        enabled: couponReminderTemplate?.isEnabled || false,
        daysBefore: couponReminderTemplate?.daysBefore || 0,
        message: couponReminderTemplate?.message || "",
      },
      birthdayAutomation: {
        enabled: config.birthdayAutomationEnabled,
        messageTemplate: config.birthdayMessageTemplate,
        daysBefore: config.birthdayDaysBefore,
        rewardType: config.birthdayRewardType,
        rewardId: config.birthdayRewardId,
        couponValidityDays: config.birthdayCouponValidityDays,
      },
      detractorAutomation: {
        enabled: config.sendDetractorMessageToClient,
        messageTemplate: config.detractorMessageTemplate,
        notifyOwner: config.notifyDetractorToOwner,
        ownerMessageTemplate: config.detractorOwnerMessageTemplate,
        ownerPhoneNumbers: config.detractorOwnerPhoneNumbers,
      },
    };

    res.json(response);
  }),

  updateInstanceConfig: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const data = req.body;

    const config = await whatsappConfigRepository.findByTenant(tenantId);
    if (!config) {
      throw new ApiError(
        404,
        "Configuração do WhatsApp não encontrada. Crie uma instância primeiro.",
      );
    }

    // 1. Atualizar a tabela principal WhatsappConfig
    const configUpdateData = {
      // Mapeamento para dailyReport
      dailyReportEnabled: data.dailyReport.enabled,
      reportPhoneNumbers: data.dailyReport.reportPhoneNumbers,
      // Mapeamento para prizeRoulette (note a mudança de nome dos campos)
      sendPrizeMessage: data.prizeRoulette.enabled,
      prizeMessageTemplate: data.prizeRoulette.template,
      // Mapeamento para birthdayAutomation
      birthdayAutomationEnabled: data.birthdayAutomation.enabled,
      birthdayMessageTemplate: data.birthdayAutomation.messageTemplate,
      birthdayDaysBefore: data.birthdayAutomation.daysBefore,
      birthdayRewardType: data.birthdayAutomation.rewardType,
      birthdayRewardId: data.birthdayAutomation.rewardId || null,
      birthdayCouponValidityDays: data.birthdayAutomation.couponValidityDays,
      // Mapeamento para detractorAutomation
      sendDetractorMessageToClient: data.detractorAutomation.enabled,
      detractorMessageTemplate: data.detractorAutomation.messageTemplate,
      notifyDetractorToOwner: data.detractorAutomation.notifyOwner,
      detractorOwnerMessageTemplate: data.detractorAutomation.ownerMessageTemplate,
      detractorOwnerPhoneNumbers: data.detractorAutomation.ownerPhoneNumbers,
    };
    await config.update(configUpdateData);

    // 2. Criar ou atualizar o WhatsappTemplate para couponReminder
    const [template, created] = await WhatsappTemplate.findOrCreate({
      where: { tenantId: tenantId, type: "COUPON_REMINDER" },
      defaults: {
        isEnabled: data.couponReminder.enabled,
        daysBefore: data.couponReminder.daysBefore,
        message: data.couponReminder.message,
      },
    });

    if (!created) {
      await template.update({
        isEnabled: data.couponReminder.enabled,
        daysBefore: data.couponReminder.daysBefore,
        message: data.couponReminder.message,
      });
    }

    res
      .status(200)
      .json({ message: "Configurações de automação salvas com sucesso." });
  }),

  getConnectionInfo: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const info = await whatsappService.getConnectionInfo(tenantId);
    res.json(info);
  }),

  createInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const result = await whatsappService.createRemoteInstance(tenantId);
    res.json(result);
  }),

  getQrCode: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const qrCodeData = await whatsappService.getQrCodeForConnect(tenantId);
    res.json(qrCodeData);
  }),

  logoutInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const result = await whatsappService.logoutInstance(tenantId);
    res.json(result);
  }),

  restartInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const result = await whatsappService.restartInstance(tenantId);
    res.json(result);
  }),

  deleteInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const result = await whatsappService.deleteInstance(tenantId);
    res.json(result);
  }),

  // --- Rotas para o Super Admin ---

  getAllConfigsWithStatus: asyncHandler(async (req, res) => {
    const allConfigs = await whatsappService.getAllInstanceStatuses();
    res.json(allConfigs);
  }),

  superAdminRestartInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const result = await whatsappService.restartInstance(tenantId);
    res.json(result);
  }),

  superAdminLogoutInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const result = await whatsappService.logoutInstance(tenantId);
    res.json(result);
  }),

  superAdminDeleteInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const result = await whatsappService.deleteInstance(tenantId);
    res.json(result);
  }),

  getTenantConfig: asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const config = await whatsappConfigRepository.findByTenant(tenantId);
    if (!config) {
      throw new ApiError(404, "Configuração do WhatsApp não encontrada.");
    }
    res.json(config);
  }),

  saveTenantConfig: asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const { url, apiKey } = req.body;

    if (!url || url.trim() === "") {
      throw new ApiError(400, "A URL da API do WhatsApp é obrigatória.");
    }
    if (!apiKey || apiKey.trim() === "") {
      throw new ApiError(400, "A chave da API do WhatsApp é obrigatória.");
    }

    const existingConfig =
      await whatsappConfigRepository.findByTenant(tenantId);

    let config;
    if (existingConfig) {
      config = await whatsappConfigRepository.updateByTenant(tenantId, {
        url,
        apiKey,
      });
    } else {
      config = await whatsappConfigRepository.create({ tenantId, url, apiKey });
    }

    res.json(config);
  }),

  // --- Webhook ---
  handleWebhook: asyncHandler(async (req, res) => {
    const { instance, event, data } = req.body;

    if (!event) {
      return res.sendStatus(200); // Apenas confirma o recebimento se não houver evento
    }

    if (event === "connection.update") {
      const { state } = data;
      const newStatus = state === "CONNECTED" ? "connected" : "disconnected";
      await whatsappWebhookRepository.updateStatusByInstanceName(
        instance,
        newStatus,
      );
    }

    res.sendStatus(200);
  }),
};

module.exports = whatsappConfigController;
