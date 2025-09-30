const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    return await WhatsappConfig.findOne({ where: { tenantId } });
  }

  async upsert(data) {
    const { tenantId } = data;
    let config = await this.findByTenant(tenantId);

    const updateData = { ...data };

    if (config) {
      // Se a configuração já existe, atualize-a
      await config.update(updateData);
    } else {
      // Se não existir, crie uma nova
      config = await WhatsappConfig.create(updateData);
    }

    // Garante que o instanceName seja válido
    if (!config.instanceName || config.instanceName.includes(' ')) {
      const tenant = await Tenant.findByPk(tenantId);
      const newInstanceName = (tenant && tenant.name)
        ? tenant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : tenantId;
      await config.update({ instanceName: newInstanceName });
    }

    return config.reload();
  }

  async deleteByTenantId(tenantId) {
    return await WhatsappConfig.destroy({ where: { tenantId } });
  }
}

module.exports = new WhatsappConfigRepository();
