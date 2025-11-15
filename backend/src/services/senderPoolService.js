const { WhatsappSender, sequelize } = require('../../models');
const { zonedTimeToUtc } = require('date-fns-tz/zonedTimeToUtc');
const { Op } = require('sequelize');

const WARMING_UP_CASE_STATEMENT = `
  CASE "warmingUpDay"
    WHEN 1 THEN 0.10
    WHEN 2 THEN 0.20
    WHEN 3 THEN 0.35
    WHEN 4 THEN 0.50
    WHEN 5 THEN 0.65
    WHEN 6 THEN 0.80
    WHEN 7 THEN 1.00
    ELSE 0
  END
`;

class SenderPoolService {
  async getAvailableSender() {
    return sequelize.transaction(async (t) => {
      const sender = await WhatsappSender.findOne({
        where: {
          [Op.or]: [
            {
              status: 'active',
              messagesSentToday: { [Op.lt]: sequelize.col('dailyLimit') }
            },
            {
              status: 'warming_up',
              [Op.and]: [
                sequelize.literal(`"messagesSentToday" < CEILING("dailyLimit" * ${WARMING_UP_CASE_STATEMENT})`)
              ]
            }
          ]
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
      sender.lastUsedAt = zonedTimeToUtc(new Date(), 'America/Sao_Paulo');
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
    if (sender && ['active', 'warming_up'].includes(sender.status)) {
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
