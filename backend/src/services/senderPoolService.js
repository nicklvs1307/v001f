const { WhatsappSender } = require('../../models');
const { Op } = require('sequelize');
const whatsappSenderRepository = require('../repositories/whatsappSenderRepository');

class SenderPoolService {
  /**
   * Selects the best available sender from the pool.
   * Logic:
   * 1. Finds all 'active' senders.
   * 2. Filters out any that have reached their daily limit.
   * 3. Sorts them by priority (lower first), then by last used date (oldest first).
   * 4. Returns the top one.
   */
  async getAvailableSender() {
    const activeSenders = await WhatsappSender.findAll({
      where: {
        status: 'active',
        messagesSentToday: {
          [Op.lt]: sequelize.col('dailyLimit'), // Use sequelize.col to reference another column
        },
      },
      order: [
        ['priority', 'ASC'],
        ['lastUsedAt', 'ASC'],
      ],
    });

    if (!activeSenders || activeSenders.length === 0) {
      throw new Error('Nenhum disparador disponível no pool.');
    }

    return activeSenders[0];
  }

  /**
   * Increments the message count and updates the last used timestamp for a sender.
   * @param {string} senderId The ID of the sender.
   */
  async recordSuccessfulSend(senderId) {
    const sender = await whatsappSenderRepository.findById(senderId);
    if (sender) {
      sender.messagesSentToday += 1;
      sender.lastUsedAt = new Date();
      await sender.save();
    }
  }

  /**
   * Marks a sender as blocked or disconnected upon a failed send.
   * @param {string} senderId The ID of the sender.
   * @param {string} errorType The type of error ('blocked', 'disconnected').
   */
  async reportFailedSender(senderId, errorType = 'disconnected') {
    const sender = await whatsappSenderRepository.findById(senderId);
    if (sender && sender.status === 'active') { // Avoid changing status if it's already blocked/resting
      await sender.update({ status: errorType });
    }
  }

  /**
   * Resets the daily message count for all senders.
   * This should be run by a scheduled job once a day.
   */
  async resetDailyCounts() {
    console.log('[SenderPoolService] Resetando contagem diária de mensagens...');
    await WhatsappSender.update(
      { messagesSentToday: 0 },
      { where: {} }
    );
    console.log('[SenderPoolService] Contagem diária resetada.');
  }
}

module.exports = new SenderPoolService();
