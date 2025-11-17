const { WhatsappConfig } = require("../../models");
const { getSocketIO } = require("../socket");

class WhatsappWebhookRepository {
  async findByInstanceName(instanceName) {
    return await WhatsappConfig.findOne({ where: { instanceName } });
  }

  async updateStatusByInstanceName(instanceName, status) {
    const config = await this.findByInstanceName(instanceName);
    if (config) {
      config.instanceStatus = status;
      await config.save();
      console.log(
        `Status da instância ${instanceName} atualizado para ${status}`,
      );

      // Notifica o frontend via Socket.IO
      try {
        const io = getSocketIO();
        const payload = { tenantId: config.tenantId, status: status };
        io.to(config.tenantId).emit("whatsapp:status", payload);
        console.log(
          `Evento de socket 'whatsapp:status' emitido para a sala do tenant ${config.tenantId}`,
          payload,
        );
      } catch (error) {
        console.error("Falha ao emitir evento de socket:", error);
      }

      return config;
    }
    console.log(
      `Nenhuma configuração encontrada para a instância ${instanceName}`,
    );
    return null;
  }
}

module.exports = new WhatsappWebhookRepository();
