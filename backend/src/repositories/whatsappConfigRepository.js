const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    const { WhatsappConfig } = require('../../models');
    return await WhatsappConfig.findOne({ where: { tenantId } });
  }

  async upsert(tenantId, data) {
    const { WhatsappConfig } = require('../../models');

    const existingConfig = await this.findByTenant(tenantId);

    if (existingConfig) {
      return existingConfig.update(data);
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
