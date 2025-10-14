const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    return await WhatsappConfig.findOne({ where: { tenantId }, raw: true });
  }

  async upsert(tenantId, data) {
    const { WhatsappConfig } = require('../../models');

    const existingConfig = await this.findByTenant(tenantId);

    if (existingConfig) {
      // O findByTenant retorna um objeto raw, então não podemos usar o .update() da instância.
      // Usamos o update do modelo, que é o que eu tentei antes, mas agora faz parte de uma lógica de upsert.
      const [rowCount] = await WhatsappConfig.update(data, { where: { tenantId } });
      // Retorna os dados atualizados
      return this.findByTenant(tenantId);
    } else {
      // Cria um novo registro se não existir
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
