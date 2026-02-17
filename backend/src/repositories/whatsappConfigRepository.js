const { WhatsappConfig, Tenant } = require("../../models");
const { Op } = require("sequelize");

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
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

  async findAllWithWeeklyReportEnabled() {
    return await WhatsappConfig.findAll({
      where: {
        weeklyReportEnabled: true,
        reportPhoneNumbers: {
          [Op.ne]: null,
          [Op.not]: "",
        },
      },
      raw: true,
    });
  }

  async findAllWithMonthlyReportEnabled() {
    return await WhatsappConfig.findAll({
      where: {
        monthlyReportEnabled: true,
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

  async updateReportSentAt(configId, type) {
    const field =
      type === "daily"
        ? "lastDailyReportSentAt"
        : type === "weekly"
          ? "lastWeeklyReportSentAt"
          : "lastMonthlyReportSentAt";

    return await WhatsappConfig.update(
      { [field]: new Date() },
      { where: { id: configId } },
    );
  }
}

module.exports = new WhatsappConfigRepository();
