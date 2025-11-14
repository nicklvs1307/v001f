const cron = require('node-cron');
const { zonedTimeToUtc } = require('date-fns-tz');
const { Op } = require('sequelize');
const { Cupom } = require('../../models');

// Roda todo dia à meia-noite
const schedule = '0 0 * * *';

const task = cron.schedule(schedule, async () => {
  console.log('[Job] Iniciando verificação de cupons expirados...');

  try {
    const today = zonedTimeToUtc(new Date(), 'America/Sao_Paulo');
    today.setHours(0, 0, 0, 0); // Define para o início do dia

    const [updateCount] = await Cupom.update(
      { status: 'expired' },
      {
        where: {
          status: 'active',
          dataValidade: {
            [Op.lt]: today,
          },
        },
      }
    );

    if (updateCount > 0) {
      console.log(`[Job] ${updateCount} cupons foram atualizados para 'expirado'.`);
    } else {
      console.log('[Job] Nenhum cupom expirado encontrado.');
    }
  } catch (error) {
    console.error('[Job] Erro ao executar o job de expiração de cupons:', error);
  }

  console.log('[Job] Verificação de cupons expirados concluída.');
}, {
  scheduled: false,
  timezone: "America/Sao_Paulo"
});

module.exports = {
  start: () => {
    console.log('Agendador de expiração de cupons iniciado. A tarefa será executada todo dia à meia-noite.');
    task.start();
  },
  stop: () => {
    console.log('Agendador de expiração de cupons parado.');
    task.stop();
  }
};
