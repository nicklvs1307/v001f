
const cron = require('node-cron');
const { Campanha } = require('../../models');
const CampanhaService = require('../services/campanhaService');
const campanhaRepository = require('../repositories/campanhaRepository');
const clientRepository = require('../repositories/clientRepository');
const cupomRepository = require('../repositories/cupomRepository');
const roletaSpinRepository = require('../repositories/roletaSpinRepository');
const whatsappService = require('../services/whatsappService');

// Instanciando o CampanhaService com suas dependências
const campanhaService = new CampanhaService(
  campanhaRepository,
  clientRepository,
  cupomRepository,
  roletaSpinRepository,
  whatsappService
);

const scheduledJobs = new Map();

function scheduleCampaign(campaign) {
  if (!campaign.startDate || campaign.status !== 'draft') {
    return;
  }

  const cronTime = new Date(campaign.startDate);
  const job = cron.schedule(cronTime, () => {
    console.log(`[Scheduler] Executando campanha agendada: ${campaign.id}`);
    campanhaService._processCampaign(campaign.id, campaign.tenantId)
      .catch(err => {
        console.error(`[Scheduler] Erro ao processar campanha ${campaign.id}:`, err);
        campanhaRepository.update(campaign.id, { status: 'failed' }, campaign.tenantId);
      });
    scheduledJobs.delete(campaign.id);
  });

  scheduledJobs.set(campaign.id, job);
  console.log(`[Scheduler] Campanha ${campaign.id} agendada para ${cronTime}`);
}

async function initScheduledJobs() {
  console.log('[Scheduler] Inicializando jobs agendados...');
  const scheduledCampaigns = await Campanha.findAll({
    where: {
      status: 'draft',
      startDate: { [Op.ne]: null },
    },
  });

  for (const campaign of scheduledCampaigns) {
    scheduleCampaign(campaign);
  }
  console.log(`[Scheduler] ${scheduledCampaigns.length} campanhas reagendadas.`);
}

module.exports = {
  scheduleCampaign,
  initScheduledJobs,
};
