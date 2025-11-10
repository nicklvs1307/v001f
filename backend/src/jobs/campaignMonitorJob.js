const schedule = require('node-schedule');
const { Campanha, WhatsappSender, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { scheduleCampaign } = require('./campaignScheduler');

// We need to lazy-load services to avoid circular dependency issues at startup
let campanhaServiceInstance;
function getCampanhaService() {
  if (!campanhaServiceInstance) {
    const CampanhaService = require('../services/campanhaService');
    campanhaServiceInstance = new CampanhaService(
      require('../repositories/campanhaRepository'),
      require('../repositories/clientRepository'),
      require('../repositories/cupomRepository'),
      require('../repositories/roletaSpinRepository'),
      require('../services/whatsappService')
    );
  }
  return campanhaServiceInstance;
}


const JOB_NAME = 'CAMPAIGN_MONITOR';
let job = null;

// This is a simplified check. A more advanced one could check the actual query from senderPoolService.
async function hasAvailableSenders() {
  const availableSender = await WhatsappSender.findOne({
    where: {
      status: { [Op.in]: ['active', 'warming_up'] },
      messagesSentToday: { [Op.lt]: sequelize.col('dailyLimit') },
    },
  });
  return !!availableSender;
}

async function checkPausedCampaigns() {
  console.log(`[${JOB_NAME}] Iniciando verificação de campanhas pausadas...`);
  
  const pausedCampaigns = await Campanha.findAll({
    where: { status: 'paused' },
  });

  if (pausedCampaigns.length === 0) {
    console.log(`[${JOB_NAME}] Nenhuma campanha pausada encontrada.`);
    return;
  }

  console.log(`[${JOB_NAME}] Verificando ${pausedCampaigns.length} campanha(s) pausada(s).`);

  const sendersAvailable = await hasAvailableSenders();
  if (!sendersAvailable) {
    console.log(`[${JOB_NAME}] Nenhum disparador disponível. As campanhas permanecerão pausadas.`);
    return;
  }

  console.log(`[${JOB_NAME}] Disparadores disponíveis. Tentando re-agendar campanhas pausadas.`);
  
  const service = getCampanhaService();

  for (const campaign of pausedCampaigns) {
    try {
      console.log(`[${JOB_NAME}] Re-agendando campanha ${campaign.id}.`);
      // Update status and set start date to now to trigger immediate (or near-immediate) processing
      await campaign.update({ status: 'scheduled', startDate: new Date() });
      // Use the existing scheduler to restart the campaign
      scheduleCampaign(campaign, service._processCampaign.bind(service));
    } catch (error) {
      console.error(`[${JOB_NAME}] Erro ao re-agendar a campanha ${campaign.id}:`, error.message);
    }
  }

  console.log(`[${JOB_NAME}] Verificação de campanhas pausadas concluída.`);
}

function initCampaignMonitorJob() {
  // Runs every 10 minutes
  if (job) {
    job.cancel();
  }
  job = schedule.scheduleJob('*/10 * * * *', checkPausedCampaigns);
  console.log('[CampaignMonitorJob] Job de monitoramento de campanhas inicializado para rodar a cada 10 minutos.');
}

module.exports = {
  initCampaignMonitorJob,
  checkPausedCampaigns,
};
