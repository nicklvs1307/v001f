const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    return await WhatsappConfig.findOne({ where: { tenantId } });
  }

  async upsert(data) {
    const { tenantId } = data;
    let config = await this.findByTenant(tenantId);

    if (config) {
      return await config.update(data);
    } else {
      const newData = { ...data };
      if (!newData.instanceName) {
        const tenant = await Tenant.findByPk(tenantId);
        newData.instanceName = tenant ? tenant.name : tenantId; 
      }
      return await WhatsappConfig.create(newData);
    }
  }

  async deleteByTenantId(tenantId) {
    return await WhatsappConfig.destroy({ where: { tenantId } });
  }
}

module.exports = new WhatsappConfigRepository();
