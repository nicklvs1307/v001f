const cron = require('node-cron');
const { Cupom, Client, Tenant, WhatsappTemplate } = require('../../models');
const { fromZonedTime } = require('date-fns-tz');
const { Op } = require('sequelize');
const whatsappService = require('../services/whatsappService');
const { format } = require('date-fns');

const schedule = '0 9 * * *'; // Todos os dias às 9:00

const task = cron.schedule(schedule, async () => {
  console.log('[Job] Iniciando verificação de lembretes de cupons...');

  try {
    const templates = await WhatsappTemplate.findAll({
      where: {
        type: 'COUPON_REMINDER',
        isEnabled: true,
      },
    });

    if (templates.length === 0) {
      console.log('[Job] Nenhuma automação de lembrete de cupom ativa. Encerrando.');
      return;
    }

    for (const template of templates) {
      const { tenantId, daysBefore, message } = template;

      if (!daysBefore || daysBefore <= 0) {
        continue;
      }

      const targetDate = fromZonedTime(new Date(), 'America/Sao_Paulo');
      targetDate.setDate(targetDate.getDate() + daysBefore);

      const couponsToRemind = await Cupom.findAll({
        where: {
          tenantId,
          status: 'active',
          dataValidade: {
            [Op.gte]: new Date(targetDate.setHours(0, 0, 0, 0)),
            [Op.lt]: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
        include: [{ model: Client, as: 'cliente', required: true }],
      });

      if (couponsToRemind.length > 0) {
        console.log(`[Job] ${couponsToRemind.length} cupons encontrados para enviar lembrete para o tenant ${tenantId}.`);
      }

      for (const coupon of couponsToRemind) {
        const client = coupon.cliente;
        if (client && client.phone) {
          const personalizedMessage = message
            .replace(/{{nome_cliente}}/g, client.name)
            .replace(/{{codigo_cupom}}/g, coupon.codigo)
            .replace(/{{data_validade}}/g, format(new Date(coupon.dataValidade), 'dd/MM/yyyy'));

          try {
            await whatsappService.sendTenantMessage(tenantId, client.phone, personalizedMessage);
          } catch (err) {
            console.error(`[Job] Falha ao enviar lembrete para ${client.phone} do tenant ${tenantId}:`, err.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('[Job] Erro crítico ao executar o job de lembrete de cupons:', error);
  }

  console.log('[Job] Verificação de lembretes de cupons concluída.');
}, {
  scheduled: false,
  timezone: "America/Sao_Paulo"
});

module.exports = {
  start: () => {
    console.log('Agendador de lembrete de cupons iniciado. A tarefa será executada todos os dias às 9:00.');
    task.start();
  },
  stop: () => {
    console.log('Agendador de lembrete de cupons parado.');
    task.stop();
  }
};
