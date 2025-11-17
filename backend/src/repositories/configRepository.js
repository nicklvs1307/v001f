const { Tenant } = require("../../models");

class ConfigRepository {
  async getTenantConfig(tenantId) {
    return Tenant.findByPk(tenantId);
  }

  async updateTenantConfig(tenantId, configData) {
    const tenant = await Tenant.findByPk(tenantId);
    if (tenant) {
      await tenant.update(configData);
      return tenant;
    }
    return null;
  }
}

module.exports = new ConfigRepository();
