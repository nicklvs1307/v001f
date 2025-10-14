const cron = require('node-cron');
const { format } = require('date-fns');
const whatsappService = require('../services/whatsappService');
const whatsappConfigRepository = require('../repositories/whatsappConfigRepository'); // Importar o novo repositório
const tenantRepository = require('../repositories/tenantRepository'); // Manter para buscar o nome do tenant
const resultRepository = require('../repositories/resultRepository');

const schedule = '0 8 * * *'; // Todos os dias às 8:00

const dailyReportTask = cron.schedule(schedule, async () => {
  console.log('Executando a tarefa de relatório diário...');

  try {
    // 1. Buscar todas as configurações do WhatsApp que têm o relatório diário ativado.
    const configsToReport = await whatsappConfigRepository.findAllWithDailyReportEnabled();

    if (!configsToReport || configsToReport.length === 0) {
      console.log('Nenhuma configuração de WhatsApp com relatório diário ativado encontrada.');
      return;
    }

    console.log(`Encontradas ${configsToReport.length} configurações para receber relatórios.`);

    // 2. Para cada configuração, gerar o relatório e enviar.
    for (const config of configsToReport) {
      console.log(`Gerando relatório para o tenantId: ${config.tenantId}`);
      
      // Precisamos do nome do tenant para a mensagem
      const tenant = await tenantRepository.getTenantById(config.tenantId);
      if (!tenant) {
        console.warn(`Tenant ${config.tenantId} não encontrado para a configuração de relatório.`);
        continue;
      }

      const stats = await resultRepository.getDailyStats(config.tenantId);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate = format(yesterday, 'dd/MM/yyyy');

      const message = `
*Resumo Diário - ${tenant.name}*
_${formattedDate}_

Olá! Aqui está o resumo de ontem:

- *Total de Respostas NPS:* ${stats.totalResponses}
- *Promotores (9-10):* ${stats.promoters}
- *Neutros (7-8):* ${stats.neutrals}
- *Detratores (0-6):* ${stats.detractors}

_Este é um relatório automático do sistema Feedeliza._
      `.trim();

      // Envia para cada número configurado
      const phoneNumbers = config.reportPhoneNumbers.split(',').map(p => p.trim()).filter(p => p);
      for (const phoneNumber of phoneNumbers) {
        await whatsappService.sendSystemMessage(phoneNumber, message);
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