const { WhatsappSender, sequelize } = require('../../models');
const { Op } = require('sequelize');

class SenderPoolService {
  async getAvailableSender() {
    return sequelize.transaction(async (t) => {
      const sender = await WhatsappSender.findOne({
        where: {
          status: 'active',
          messagesSentToday: {
            [Op.lt]: sequelize.col('dailyLimit'),
          },
        },
        order: [
          ['priority', 'ASC'],
          ['lastUsedAt', 'ASC'],
        ],
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!sender) {
        throw new Error('Nenhum disparador disponível no pool no momento.');
      }

      // Immediately mark this sender as "in-use" by updating its lastUsedAt
      sender.lastUsedAt = new Date();
      await sender.save({ transaction: t });

      return sender;
    });
  }

  async recordSuccessfulSend(senderId) {
    return sequelize.transaction(async (t) => {
      const sender = await WhatsappSender.findByPk(senderId, { lock: t.LOCK.UPDATE, transaction: t });
      if (sender) {
        sender.messagesSentToday += 1;
        await sender.save({ transaction: t });
      }
    });
  }

  async reportFailedSender(senderId, errorType = 'disconnected') {
    const sender = await WhatsappSender.findByPk(senderId);
    if (sender && sender.status === 'active') {
      await sender.update({ status: errorType });
    }
  }

  async releaseSender(senderId) {
    // Optional: Logic to manually release a sender if a job fails catastrophically
    // For now, we rely on the transaction rollback.
  }

  async resetDailyCounts() {
    console.log('[SenderPoolService] Resetando contagem diária de mensagens...');
    await WhatsappSender.update(
      { messagesSentToday: 0 },
      { where: { messagesSentToday: { [Op.gt]: 0 } } }
    );
    console.log('[SenderPoolService] Contagem diária resetada.');
  }
}

module.exports = new SenderPoolService();
