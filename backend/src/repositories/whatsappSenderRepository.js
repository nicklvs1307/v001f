const { WhatsappSender } = require('../../models');

class WhatsappSenderRepository {
  async findAll() {
    return WhatsappSender.findAll({
      order: [['priority', 'ASC'], ['name', 'ASC']],
    });
  }

  async findById(id) {
    return WhatsappSender.findByPk(id);
  }

  async create(data) {
    return WhatsappSender.create(data);
  }

  async update(id, data) {
    const sender = await this.findById(id);
    if (sender) {
      return sender.update(data);
    }
    return null;
  }

  async delete(id) {
    const sender = await this.findById(id);
    if (sender) {
      await sender.destroy();
      return true;
    }
    return false;
  }

  async findAvailableSender() {
    // This is a placeholder for the sender selection logic.
    // The actual implementation will be more complex, considering status, priority, limits, etc.
    return WhatsappSender.findOne({
      where: {
        status: 'active',
      },
      order: [['lastUsedAt', 'ASC']],
    });
  }
}

module.exports = new WhatsappSenderRepository();
