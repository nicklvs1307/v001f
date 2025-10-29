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

      // Define date ranges for yesterday and the day before
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfYesterday = new Date(new Date(yesterday).setHours(0, 0, 0, 0));
      const endOfYesterday = new Date(new Date(yesterday).setHours(23, 59, 59, 999));

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const startOfTwoDaysAgo = new Date(new Date(twoDaysAgo).setHours(0, 0, 0, 0));
      const endOfTwoDaysAgo = new Date(new Date(twoDaysAgo).setHours(23, 59, 59, 999));

      // Fetch summaries for both days
      const yesterdaySummary = await dashboardRepository.getSummary(config.tenantId, startOfYesterday, endOfYesterday);
      const twoDaysAgoSummary = await dashboardRepository.getSummary(config.tenantId, startOfTwoDaysAgo, endOfTwoDaysAgo);

      // Calculate difference
      const diff = yesterdaySummary.totalResponses - twoDaysAgoSummary.totalResponses;
      const diffArrow = diff > 0 ? '⬆' : diff < 0 ? '⬇' : '➖';
      const diffText = `(${diffArrow} ${diff} respostas em relação ${format(twoDaysAgo, 'dd/MM/yyyy')})`;

      // Format dates for the message
      const formattedDate = format(yesterday, 'dd/MM/yyyy');
      const isoDate = format(yesterday, 'yyyy-MM-dd');
      const baseUrl = process.env.FRONTEND_URL || 'https://loyalfood.towersfy.com';
      const reportUrl = `${baseUrl}/relatorios/diario?date=${isoDate}`;

      // Construct the new message
      const message = `*Relatorio Diario ${tenant.name}*\n\n` +
                      `Aqui está o resumo da experiência dos seus clientes no dia ${formattedDate}!\n` +
                      `📊 Total de respostas: ${yesterdaySummary.totalResponses} ${diffText}\n` +
                      `🟢 Número de Promotores: ${yesterdaySummary.nps.promoters}\n` +
                      `🟡 Número de Neutros: ${yesterdaySummary.nps.neutrals}\n` +
                      `🔴 Número de Detratores: ${yesterdaySummary.nps.detractors}\n\n` +
                      `🔗 Para acessar o sistema, visite ${reportUrl}`;

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
