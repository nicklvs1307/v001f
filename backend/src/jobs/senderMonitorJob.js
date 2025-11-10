const schedule = require('node-schedule');
const { WhatsappSender } = require('../../models');
const whatsappService = require('../services/whatsappService');
const { Op } = require('sequelize');

const JOB_NAME = 'SENDER_MONITOR';
let job = null;

async function checkSenderStatuses() {
  console.log(`[${JOB_NAME}] Iniciando verificação de status dos disparadores...`);
  const inactiveSenders = await WhatsappSender.findAll({
    where: {
      status: {
        [Op.in]: ['disconnected', 'blocked', 'resting'],
      },
    },
  });

  if (inactiveSenders.length === 0) {
    console.log(`[${JOB_NAME}] Nenhum disparador inativo encontrado.`);
    return;
  }

  console.log(`[${JOB_NAME}] Verificando ${inactiveSenders.length} disparador(es) inativo(s).`);

  for (const sender of inactiveSenders) {
    try {
      // getSenderInstanceStatus already updates the status in the DB if it changes
      await whatsappService.getSenderInstanceStatus(sender);
    } catch (error) {
      console.error(`[${JOB_NAME}] Erro ao verificar status do disparador ${sender.name}:`, error.message);
    }
  }

  console.log(`[${JOB_NAME}] Verificação de status concluída.`);
}

function initSenderMonitorJob() {
  // Runs every 5 minutes
  if (job) {
    job.cancel();
  }
  job = schedule.scheduleJob('*/5 * * * *', checkSenderStatuses);
  console.log('[SenderMonitorJob] Job de monitoramento de disparadores inicializado para rodar a cada 5 minutos.');
}

module.exports = {
  initSenderMonitorJob,
  checkSenderStatuses,
};
