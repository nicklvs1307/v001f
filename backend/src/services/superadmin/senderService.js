const whatsappSenderRepository = require('../../repositories/whatsappSenderRepository');
const whatsappService = require('../whatsappService'); // Import whatsappService
const ApiError = require('../../errors/ApiError');

class SenderService {
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
    return whatsappSenderRepository.create(data);
  }

  async updateSender(id, data) {
    await this.getSenderById(id); // Ensures sender exists
    return whatsappSenderRepository.update(id, data);
  }

  async deleteSender(id) {
    await this.getSenderById(id); // Ensures sender exists before trying to delete
    return whatsappSenderRepository.delete(id);
  }

  async getSenderStatus(id) {
    const sender = await this.getSenderById(id);
    return whatsappService.getSenderInstanceStatus(sender);
  }

  async getSenderQrCode(id) {
    const sender = await this.getSenderById(id);
    return whatsappService.getSenderQrCodeForConnect(sender);
  }
}

module.exports = new SenderService();
