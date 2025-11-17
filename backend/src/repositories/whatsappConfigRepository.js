const { WhatsappConfig, Tenant } = require("../../models");

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    const { WhatsappConfig } = require("../../models");
    return await WhatsappConfig.findOne({ where: { tenantId } });
  }

  async create(data) {
    return await WhatsappConfig.create(data);
  }

  async updateByTenant(tenantId, data) {
    await WhatsappConfig.update(data, { where: { tenantId } });
    return await this.findByTenant(tenantId);
  }

  async findAllWithDailyReportEnabled() {
    const { Op } = require("sequelize");
    return await WhatsappConfig.findAll({
      where: {
        dailyReportEnabled: true,
        reportPhoneNumbers: {
          [Op.ne]: null,
          [Op.not]: "",
        },
      },
      raw: true,
    });
  }

  async findAllWithBirthdayAutomationEnabled() {
    return await WhatsappConfig.findAll({
      where: {
        birthdayAutomationEnabled: true,
      },
      raw: true,
    });
  }

  async deleteByTenantId(tenantId) {
    return await WhatsappConfig.destroy({ where: { tenantId } });
  }
}

module.exports = new WhatsappConfigRepository();
