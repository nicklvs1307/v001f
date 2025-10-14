const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    const { WhatsappConfig } = require('../../models');
    return await WhatsappConfig.findOne({ where: { tenantId } });
  }

  async upsert(tenantId, data) {
    const { WhatsappConfig, sequelize } = require('../../models');

    const existingConfig = await this.findByTenant(tenantId);

    if (existingConfig) {
      const { sendPrizeMessage, prizeMessageTemplate, dailyReportEnabled, reportPhoneNumbers } = data;
      await sequelize.query(
        'UPDATE whatsapp_configs SET "sendPrizeMessage" = :sendPrizeMessage, "prizeMessageTemplate" = :prizeMessageTemplate, "dailyReportEnabled" = :dailyReportEnabled, "reportPhoneNumbers" = :reportPhoneNumbers, "updatedAt" = :now WHERE "tenantId" = :tenantId',
        {
          replacements: {
            sendPrizeMessage,
            prizeMessageTemplate,
            dailyReportEnabled,
            reportPhoneNumbers,
            tenantId,
            now: new Date(),
          },
          type: sequelize.QueryTypes.UPDATE,
        }
      );
      return this.findByTenant(tenantId);
    } else {
      return WhatsappConfig.create({ ...data, tenantId });
    }
  }

  async findAllWithDailyReportEnabled() {
    const { Op } = require('sequelize');
    return await WhatsappConfig.findAll({
      where: {
        dailyReportEnabled: true,
        reportPhoneNumbers: {
          [Op.ne]: null,
          [Op.not]: ''
        }
      },
      raw: true,
    });
  }

  async deleteByTenantId(tenantId) {
    return await WhatsappConfig.destroy({ where: { tenantId } });
  }
}

module.exports = new WhatsappConfigRepository();
