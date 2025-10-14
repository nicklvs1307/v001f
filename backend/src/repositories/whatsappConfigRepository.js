const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    return await WhatsappConfig.findOne({ where: { tenantId }, raw: true });
  }

  async update(tenantId, data) {
    const { WhatsappConfig } = require('../../models');

    // Usando o método padrão do Sequelize para maior robustez
    const [rowCount] = await WhatsappConfig.update(data, {
      where: { tenantId },
    });

    console.log('[DEBUG] WhatsappConfigRepository update result:', { rowCount });

    // Após a atualização, busca os dados mais recentes para retornar ao frontend
    return this.findByTenant(tenantId);
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
