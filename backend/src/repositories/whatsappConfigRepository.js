const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    return await WhatsappConfig.findOne({ where: { tenantId }, raw: true });
  }

  async update(tenantId, data) {
    const { sequelize } = require('../../models');
    const { sendPrizeMessage, prizeMessageTemplate, dailyReportEnabled } = data;

    // Usando query bruta para contornar qualquer problema com hooks ou getters do Sequelize
    const [results] = await sequelize.query(
      'UPDATE whatsapp_configs SET "sendPrizeMessage" = :sendPrizeMessage, "prizeMessageTemplate" = :prizeMessageTemplate, "dailyReportEnabled" = :dailyReportEnabled, "updatedAt" = :now WHERE "tenantId" = :tenantId',
      {
        replacements: {
          sendPrizeMessage,
          prizeMessageTemplate,
          dailyReportEnabled,
          tenantId,
          now: new Date(),
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Após a atualização, busca os dados mais recentes para retornar ao frontend
    return this.findByTenant(tenantId);
  }

  async deleteByTenantId(tenantId) {
    return await WhatsappConfig.destroy({ where: { tenantId } });
  }
}

module.exports = new WhatsappConfigRepository();
