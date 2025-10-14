const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    const { WhatsappConfig } = require('../../models');
    return await WhatsappConfig.findOne({ where: { tenantId } });
  }

  async upsert(tenantId, data) {
    const { WhatsappConfig, sequelize } = require('../../models');

    // Estratégia radical: DELETE e INSERT para contornar possíveis triggers de UPDATE
    return sequelize.transaction(async (t) => {
      // Deleta o registro existente, se houver
      await WhatsappConfig.destroy(
        { where: { tenantId } },
        { transaction: t }
      );

      // Cria um novo registro com os dados fornecidos
      const newConfig = await WhatsappConfig.create(
        { ...data, tenantId },
        { transaction: t }
      );

      return newConfig;
    });
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
