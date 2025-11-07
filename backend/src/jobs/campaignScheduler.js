const cron = require('node-cron');

const scheduledJobs = new Map();

function scheduleCampaign(campaign, processFunction) {
  if (!campaign.startDate || campaign.status !== 'scheduled') {
    return;
  }

  // Cancelar job antigo se existir
  if (scheduledJobs.has(campaign.id)) {
    scheduledJobs.get(campaign.id).stop();
    scheduledJobs.delete(campaign.id);
  }

  const cronTime = new Date(campaign.startDate);

  // Não agendar tarefas no passado
  if (cronTime < new Date()) {
    console.log(`[Scheduler] Campanha ${campaign.id} não agendada pois a data de início já passou.`);
    return;
  }

  const job = cron.schedule(cronTime, () => {
    console.log(`[Scheduler] Executando campanha agendada: ${campaign.id}`);
    processFunction(campaign.id, campaign.tenantId);
    scheduledJobs.delete(campaign.id);
  });

  scheduledJobs.set(campaign.id, job);
  console.log(`[Scheduler] Campanha ${campaign.id} agendada para ${cronTime}`);
}

function cancelCampaign(campaignId) {
  if (scheduledJobs.has(campaignId)) {
    scheduledJobs.get(campaignId).stop();
    scheduledJobs.delete(campaignId);
    console.log(`[Scheduler] Agendamento da campanha ${campaignId} cancelado.`);
  }
}

module.exports = {
  scheduleCampaign,
  cancelCampaign,
};
