const cron = require('node-cron');
const { WhatsappSender } = require('../../models');
const { Op } = require('sequelize');

const JOB_NAME = 'WARMING_UP_PROGRESS';
let job = null;

async function progressWarmingUpSenders() {
  console.log(`[${JOB_NAME}] Iniciando progressão de aquecimento dos disparadores...`);
  
  const warmingUpSenders = await WhatsappSender.findAll({
    where: { status: 'warming_up' },
  });

  if (warmingUpSenders.length === 0) {
    console.log(`[${JOB_NAME}] Nenhum disparador em aquecimento encontrado.`);
    return;
  }

  console.log(`[${JOB_NAME}] Processando ${warmingUpSenders.length} disparador(es) em aquecimento.`);

  for (const sender of warmingUpSenders) {
    try {
      const newDay = sender.warmingUpDay + 1;
      if (newDay > 7) {
        await sender.update({ status: 'active', warmingUpDay: 0 }); // Reset day to 0 to indicate completion
        console.log(`[${JOB_NAME}] Disparador ${sender.name} concluído o aquecimento e agora está ativo.`);
      } else {
        await sender.update({ warmingUpDay: newDay });
        console.log(`[${JOB_NAME}] Disparador ${sender.name} progrediu para o dia ${newDay} de aquecimento.`);
      }
    } catch (error) {
      console.error(`[${JOB_NAME}] Erro ao processar o disparador ${sender.name}:`, error.message);
    }
  }

  console.log(`[${JOB_NAME}] Progressão de aquecimento concluída.`);
}

function initWarmingUpProgressJob() {
  // Roda todo dia à 1 da manhã
  if (job) {
    job.stop();
  }
  job = cron.schedule('0 1 * * *', progressWarmingUpSenders, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
  console.log('[WarmingUpProgressJob] Job de progressão de aquecimento inicializado para rodar diariamente à 1h.');
}

module.exports = {
  initWarmingUpProgressJob,
  progressWarmingUpSenders,
};
