const whatsappConfigRepository = require('../repositories/whatsappConfigRepository');
const whatsappTemplateRepository = require('../repositories/whatsappTemplateRepository');
const tenantRepository = require('../repositories/tenantRepository');
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
    };
  },

  updateAutomations: async (tenantId, data) => {
    const { dailyReport, prizeRoulette, couponReminder } = data;

    const configData = {
      dailyReportEnabled: dailyReport.enabled,
      reportPhoneNumbers: dailyReport.phoneNumbers,
      sendPrizeMessage: prizeRoulette.enabled,
      prizeMessageTemplate: prizeRoulette.template,
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
};

module.exports = automationService;
