const cron = require('node-cron');
const { format } = require('date-fns');
const whatsappService = require('../services/whatsappService');
const whatsappConfigRepository = require('../repositories/whatsappConfigRepository');
const tenantRepository = require('../repositories/tenantRepository');
const dashboardRepository = require('../repositories/dashboardRepository'); // Changed from resultRepository

const schedule = '0 8 * * *'; // Every day at 8:00 AM

const dailyReportTask = cron.schedule(schedule, async () => {
  console.log('Executando a tarefa de relatório diário...');

  try {
    // 1. Find all WhatsApp configurations with daily report enabled.
    const configsToReport = await whatsappConfigRepository.findAllWithDailyReportEnabled();

    if (!configsToReport || configsToReport.length === 0) {
      console.log('Nenhuma configuração de WhatsApp com relatório diário ativado encontrada.');
      return;
    }

    console.log(`Encontradas ${configsToReport.length} configurações para receber relatórios.`);

    // 2. For each configuration, generate and send the report.
    for (const config of configsToReport) {
      console.log(`Gerando relatório para o tenantId: ${config.tenantId}`);

      const tenant = await tenantRepository.getTenantById(config.tenantId);
      if (!tenant) {
        console.warn(`Tenant ${config.tenantId} não encontrado para a configuração de relatório.`);
        continue;
      }

      // Use dashboardRepository.getSummary to get the data, like in the test
      const summary = await dashboardRepository.getSummary(config.tenantId);
      const report = summary.nps;
      const totalResponses = summary.totalResponses;
      const totalNpsResponses = report.total;

      const promotersPercentage = totalNpsResponses > 0 ? ((report.promoters / totalNpsResponses) * 100).toFixed(1) : 0;
      const neutralsPercentage = totalNpsResponses > 0 ? ((report.neutrals / totalNpsResponses) * 100).toFixed(1) : 0;
      const detractorsPercentage = totalNpsResponses > 0 ? ((report.detractors / totalNpsResponses) * 100).toFixed(1) : 0;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate = format(yesterday, 'dd/MM/yyyy');

      // Standardized message format from the test
      const message = `*Relatório Diário de NPS - ${tenant.name}*\n_${formattedDate}_\n\n` +
                      `*NPS:* ${report.score}\n` +
                      `*Promotores:* ${report.promoters} (${promotersPercentage}%)\n` +
                      `*Neutros:* ${report.neutrals} (${neutralsPercentage}%)\n` +
                      `*Detratores:* ${report.detractors} (${detractorsPercentage}%)\n` +
                      `*Total de Respostas:* ${totalResponses}\n\n` +
                      `_Este é um relatório automático do sistema Feedeliza._`;

      // Send to each configured number using sendTenantMessage
      const phoneNumbers = config.reportPhoneNumbers.split(',').map(p => p.trim()).filter(p => p);
      for (const phoneNumber of phoneNumbers) {
        await whatsappService.sendTenantMessage(config.tenantId, phoneNumber, message);
        console.log(`Relatório para "${tenant.name}" enviado para ${phoneNumber}.`);
      }
    }

    console.log('Tarefa de relatório diário concluída.');
  } catch (error) {
    console.error('Erro ao executar a tarefa de relatório diário:', error);
  }
}, {
  scheduled: false,
  timezone: "America/Sao_Paulo"
});

module.exports = {
  start: () => {
    console.log('Agendador de relatório diário iniciado. A tarefa será executada todos os dias às 8:00.');
    dailyReportTask.start();
  },
  stop: () => {
    console.log('Agendador de relatório diário parado.');
    dailyReportTask.stop();
  }
};
