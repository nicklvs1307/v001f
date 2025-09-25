const { WhatsappConfig } = require('../../models');

class WhatsappWebhookRepository {
  async findByInstanceName(instanceName) {
    return await WhatsappConfig.findOne({ where: { instanceName } });
  }

  async updateStatusByInstanceName(instanceName, status) {
    const config = await this.findByInstanceName(instanceName);
    if (config) {
      config.instanceStatus = status;
      await config.save();
      console.log(`Status da instância ${instanceName} atualizado para ${status}`);
      return config;
    }
    console.log(`Nenhuma configuração encontrada para a instância ${instanceName}`);
    return null;
  }
}

module.exports = new WhatsappWebhookRepository();
