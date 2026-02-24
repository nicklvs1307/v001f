const whatsappConfigRepository = require("../repositories/whatsappConfigRepository");
const { now } = require("../utils/dateUtils");
const { startOfDay, endOfDay } = require("date-fns");
const whatsappTemplateRepository = require("../repositories/whatsappTemplateRepository");
const tenantRepository = require("../repositories/tenantRepository");
const dashboardRepository = require("../repositories/dashboardRepository"); // Importar dashboardRepository
const whatsappService = require("../services/whatsappService"); // Importar whatsappService
const ApiError = require("../errors/ApiError");

const automationService = {
  getAutomations: async (tenantId) => {
    const config = await whatsappConfigRepository.findByTenant(tenantId);
    if (!config) {
      throw new ApiError(404, "Configuração do WhatsApp não encontrada.");
    }

    const couponReminderTemplate = await whatsappTemplateRepository.findByType(
      "COUPON_REMINDER",
      tenantId,
    );

    return {
      dailyReport: {
        enabled: config.dailyReportEnabled,
        phoneNumbers: config.reportPhoneNumbers,
      },
      prizeRoulette: {
        enabled: config.sendPrizeMessage,
        template: config.prizeMessageTemplate,
      },
      couponReminder: {
        enabled: couponReminderTemplate
          ? couponReminderTemplate.isEnabled
          : false,
        daysBefore: couponReminderTemplate
          ? couponReminderTemplate.daysBefore
          : 7,
        template: couponReminderTemplate ? couponReminderTemplate.message : "",
      },
      birthdayAutomation: {
        enabled: config.birthdayAutomationEnabled,
        messageTemplate: config.birthdayMessageTemplate,
        daysBefore: config.birthdayDaysBefore,
        rewardType: config.birthdayRewardType,
        rewardId: config.birthdayRewardId,
        couponValidityDays: config.birthdayCouponValidityDays,
      },
      postSaleAutomation: {
        delayMinutes: config.postSaleDelayMinutes,
        messageTemplate: config.postSaleMessageTemplate,
        surveyId: config.postSaleSurveyId,
      },
      waiterLinkAutomation: {
        enabled: config.waiterLinkAutomationEnabled,
        messageTemplate: config.waiterLinkMessageTemplate,
        phoneNumbers: config.waiterLinkPhoneNumbers,
      },
      detractorAutomation: {
        enabled: config.sendDetractorMessageToClient,
        messageTemplate: config.detractorMessageTemplate,
        notifyOwner: config.notifyDetractorToOwner,
        ownerMessageTemplate: config.detractorOwnerMessageTemplate,
        ownerPhoneNumbers: config.detractorOwnerPhoneNumbers,
      },
    };
  },

  updateAutomations: async (tenantId, data) => {
    const {
      dailyReport,
      prizeRoulette,
      couponReminder,
      birthdayAutomation,
      detractorAutomation,
      postSaleAutomation,
      waiterLinkAutomation,
    } = data;

    const configData = {
      dailyReportEnabled: dailyReport.enabled,
      reportPhoneNumbers: dailyReport.phoneNumbers,
      sendPrizeMessage: prizeRoulette.enabled,
      prizeMessageTemplate: prizeRoulette.template,
      birthdayAutomationEnabled: birthdayAutomation.enabled,
      birthdayMessageTemplate: birthdayAutomation.messageTemplate,
      birthdayDaysBefore: birthdayAutomation.daysBefore,
      birthdayRewardType: birthdayAutomation.rewardType,
      birthdayRewardId: birthdayAutomation.rewardId,
      birthdayCouponValidityDays: birthdayAutomation.couponValidityDays,

      sendDetractorMessageToClient: detractorAutomation.enabled,
      detractorMessageTemplate: detractorAutomation.messageTemplate,
      notifyDetractorToOwner: detractorAutomation.notifyOwner,
      detractorOwnerMessageTemplate: detractorAutomation.ownerMessageTemplate,
      detractorOwnerPhoneNumbers: detractorAutomation.ownerPhoneNumbers,

      // Novos campos de Pós-Venda
      postSaleDelayMinutes: postSaleAutomation
        ? postSaleAutomation.delayMinutes
        : 0,
      postSaleMessageTemplate: postSaleAutomation
        ? postSaleAutomation.messageTemplate
        : null,
      postSaleSurveyId: postSaleAutomation ? postSaleAutomation.surveyId : null,

      // Novo campo de Link do Garçom
      waiterLinkAutomationEnabled: waiterLinkAutomation ? waiterLinkAutomation.enabled : false,
      waiterLinkMessageTemplate: waiterLinkAutomation ? waiterLinkAutomation.messageTemplate : null,
      waiterLinkPhoneNumbers: waiterLinkAutomation ? waiterLinkAutomation.phoneNumbers : null,
    };

    await whatsappConfigRepository.updateByTenant(tenantId, configData);

    const templateData = {
      type: "COUPON_REMINDER",
      isEnabled: couponReminder.enabled,
      daysBefore: couponReminder.daysBefore,
      message: couponReminder.template,
      tenantId,
    };

    await whatsappTemplateRepository.upsert(templateData);

    return await automationService.getAutomations(tenantId);
  },

  sendDailyReportTest: async (tenantId, phoneNumbers) => {
    const yesterday = now();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);

    const summary = await dashboardRepository.getSummary(
      tenantId,
      startOfYesterday,
      endOfYesterday,
    );
    const report = summary.nps;
    const totalResponses = summary.totalResponses;
    const totalNpsResponses = report.total;

    const promotersPercentage =
      totalNpsResponses > 0
        ? ((report.promoters / totalNpsResponses) * 100).toFixed(1)
        : 0;
    const neutralsPercentage =
      totalNpsResponses > 0
        ? ((report.neutrals / totalNpsResponses) * 100).toFixed(1)
        : 0;
    const detractorsPercentage =
      totalNpsResponses > 0
        ? ((report.detractors / totalNpsResponses) * 100).toFixed(1)
        : 0;

    const message =
      `*Relatório Diário de NPS*\n\n` +
      `*NPS:* ${report.score}\n` +
      `*Promotores:* ${report.promoters} (${promotersPercentage}%)\n` +
      `*Neutros:* ${report.neutrals} (${neutralsPercentage}%)\n` +
      `*Detratores:* ${report.detractors} (${detractorsPercentage}%)\n` +
      `*Total de Respostas:* ${totalResponses}\n\n` +
      `_Este é um teste do relatório diário de NPS._`;

    const numbersArray = phoneNumbers
      .split(",")
      .map((num) => num.trim())
      .filter((num) => num);

    for (const number of numbersArray) {
      await whatsappService.sendTenantMessage(tenantId, number, message);
      console.log(
        `Relatório de teste enviado para ${number} do tenant ${tenantId}`,
      );
    }
    return { message: "Relatório de teste enviado com sucesso!" };
  },

  triggerWaiterLinkUpdate: async (tenantId, surveyTitle, newLink) => {
    try {
      const config = await whatsappConfigRepository.findByTenant(tenantId);
      if (!config || !config.waiterLinkAutomationEnabled || !config.waiterLinkPhoneNumbers) {
        return;
      }

      const messageTemplate = config.waiterLinkMessageTemplate || "Olá! O novo link da pesquisa {{pesquisa}} é: {{link}}";
      const message = messageTemplate
        .replace("{{pesquisa}}", surveyTitle)
        .replace("{{link}}", newLink);

      const numbersArray = config.waiterLinkPhoneNumbers
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num);

      for (const number of numbersArray) {
        try {
          await whatsappService.sendTenantMessage(tenantId, number, message);
          console.log(`[Automation] Link de garçom enviado para ${number} (Tenant: ${tenantId})`);
        } catch (err) {
          console.error(`[Automation] Erro ao enviar link de garçom para ${number}:`, err.message);
        }
      }
    } catch (error) {
      console.error("[Automation] Erro no trigger de link de garçom:", error.message);
    }
  },
};

module.exports = automationService;
