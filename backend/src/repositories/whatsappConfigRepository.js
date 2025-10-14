const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    return await WhatsappConfig.findOne({ where: { tenantId } });
  }

  async update(tenantId, data) {
    const config = await this.findByTenant(tenantId);

    if (!config) {
      // A criação de uma nova config deve ser feita por uma rota que forneça todos os dados necessários (url, apiKey)
      // Esta rota de automação não deve criar uma nova config do zero.
      throw new Error('WhatsappConfig not found for this tenant. Cannot update automations.');
    }

    return config.update(data);
  }

  async deleteByTenantId(tenantId) {
    return await WhatsappConfig.destroy({ where: { tenantId } });
  }
}

module.exports = new WhatsappConfigRepository();
