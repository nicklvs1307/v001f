const whatsappSenderRepository = require('../../repositories/whatsappSenderRepository');
const whatsappService = require('../whatsappService');
const ApiError = require('../../errors/ApiError');

class SenderService {
  async getAllSendersWithStatus() {
    const senders = await whatsappSenderRepository.findAll();
    const sendersWithStatus = await Promise.all(
      senders.map(async (sender) => {
        const status = await whatsappService.getSenderInstanceStatus(sender);
        return { ...sender.get({ plain: true }), status };
      })
    );
    return sendersWithStatus;
  }

  async getAllSenders() {
    return whatsappSenderRepository.findAll();
  }

  async getSenderById(id) {
    const sender = await whatsappSenderRepository.findById(id);
    if (!sender) {
      throw ApiError.notFound('Sender não encontrado.');
    }
    return sender;
  }

  async createSender(data) {
    // Aqui você pode adicionar a lógica para criar a instância remotamente também, se necessário
    const newSender = await whatsappSenderRepository.create(data);
    await whatsappService.createSenderRemoteInstance(newSender);
    return newSender;
  }

  async updateSender(id, data) {
    await this.getSenderById(id); // Garante que o sender existe
    return whatsappSenderRepository.update(id, data);
  }

  async deleteSender(id) {
    const sender = await this.getSenderById(id); // Garante que o sender existe
    await whatsappService.deleteSenderInstance(sender);
    return whatsappSenderRepository.delete(id);
  }

  async getSenderQrCode(id) {
    const sender = await this.getSenderById(id);
    return whatsappService.getSenderQrCodeForConnect(sender);
  }

  async updateSenderStatusByInstance(instanceName, status) {
    const sender = await whatsappSenderRepository.findByInstanceName(instanceName);
    if (sender) {
      return whatsappSenderRepository.update(sender.id, { status });
    }
    return null;
  }
}

module.exports = new SenderService();
