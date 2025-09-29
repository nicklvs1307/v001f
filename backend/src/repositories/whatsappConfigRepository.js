const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    return await WhatsappConfig.findOne({ where: { tenantId } });
  }

  async upsert(data) {
    const { tenantId } = data;
    let config = await this.findByTenant(tenantId);

    if (config) {
      // Se a configuração já existe, mas não tem um nome de instância ou parece inválido, gere um novo.
      if (!config.instanceName || config.instanceName.includes(' ')) {
        const tenant = await Tenant.findByPk(tenantId);
        if (tenant && tenant.name) {
          const sanitizedName = tenant.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          data.instanceName = sanitizedName;
        }
      }
      return await config.update(data);
    } else {
      const newData = { ...data };
      if (!newData.instanceName) {
        const tenant = await Tenant.findByPk(tenantId);
        if (tenant && tenant.name) {
          // Sanitize the tenant name to be a valid instance name
          const sanitizedName = tenant.name
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/[^a-z0-9-]/g, ''); // Remove invalid characters
          newData.instanceName = sanitizedName;
        } else {
          newData.instanceName = tenantId; // Fallback to tenantId
        } 
      }
      return await WhatsappConfig.create(newData);
    }
  }

  async deleteByTenantId(tenantId) {
    return await WhatsappConfig.destroy({ where: { tenantId } });
  }
}

module.exports = new WhatsappConfigRepository();
