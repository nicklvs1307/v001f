const whatsappConfigRepository = require('../repositories/whatsappConfigRepository');
const whatsappTemplateRepository = require('../repositories/whatsappTemplateRepository');
const tenantRepository = require('../repositories/tenantRepository');
const dashboardRepository = require('../repositories/dashboardRepository'); // Importar dashboardRepository
const whatsappService = require('../services/whatsappService'); // Importar whatsappService
const ApiError = require('../errors/ApiError');

const automationService = {
  getAutomations: async (tenantId) => {
    const config = await whatsappConfigRepository.findByTenant(tenantId);
    if (!config) {
      throw new ApiError(404, 'Configuração do WhatsApp não encontrada.');
    }

    const couponReminderTemplate = await whatsappTemplateRepository.findByType('COUPON_REMINDER', tenantId);

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
        enabled: couponReminderTemplate ? couponReminderTemplate.isEnabled : false,
        daysBefore: couponReminderTemplate ? couponReminderTemplate.daysBefore : 7,
        template: couponReminderTemplate ? couponReminderTemplate.message : '',
      },
      birthdayAutomation: {
        enabled: config.birthdayAutomationEnabled,
        messageTemplate: config.birthdayMessageTemplate,
        daysBefore: config.birthdayDaysBefore,
        rewardType: config.birthdayRewardType,
        rewardId: config.birthdayRewardId,
        couponValidityDays: config.birthdayCouponValidityDays,
      },
    };
  },

  updateAutomations: async (tenantId, data) => {
    const { dailyReport, prizeRoulette, couponReminder, birthdayAutomation } = data;

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
    };

    await whatsappConfigRepository.updateByTenant(tenantId, configData);

    const templateData = {
      type: 'COUPON_REMINDER',
      isEnabled: couponReminder.enabled,
      daysBefore: couponReminder.daysBefore,
      message: couponReminder.template,
      tenantId,
    };

    await whatsappTemplateRepository.upsert(templateData);

    return await automationService.getAutomations(tenantId);
  },

  sendDailyReportTest: async (tenantId, phoneNumbers) => {
    const report = await dashboardRepository.getSummary(tenantId);
    const message = `*Relatório Diário de NPS*\n\n` +
                    `*NPS:* ${report.npsScore}\n` +
                    `*Promotores:* ${report.promoters} (${report.promotersPercentage}%)\n` +
                    `*Neutros:* ${report.neutrals} (${report.neutralsPercentage}%)\n` +
                    `*Detratores:* ${report.detractors} (${report.detractorsPercentage}%)\n` +
                    `*Total de Respostas:* ${report.totalResponses}\n\n` +
                    `_Este é um teste do relatório diário de NPS._`;

    const numbersArray = phoneNumbers.split(',').map(num => num.trim()).filter(num => num);

    for (const number of numbersArray) {
          await whatsappService.sendTenantMessage(tenantId, number, message);
          console.log(`Mensagem de aniversário enviada para ${client.name} (${client.phone}) do tenant ${config.tenantId}`);
    }
    return { message: 'Relatório de teste enviado com sucesso!' };
  },
};

module.exports = automationService;
