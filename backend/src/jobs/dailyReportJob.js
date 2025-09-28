const cron = require('node-cron');
const whatsappService = require('../services/whatsappService');
const tenantRepository = require('../repositories/tenantRepository');
const resultRepository = require('../repositories/resultRepository');

const schedule = '0 8 * * *'; // Todos os dias às 8:00

const dailyReportTask = cron.schedule(schedule, async () => {
  console.log('Executando a tarefa de relatório diário...');

  try {
    // 1. Buscar todos os tenants que têm um número de telefone para receber relatórios.
    const tenantsToReport = await tenantRepository.findAllWithReportPhoneNumber();

    if (!tenantsToReport || tenantsToReport.length === 0) {
      console.log('Nenhum tenant com número de telefone para relatório encontrado.');
      return;
    }

    console.log(`Encontrados ${tenantsToReport.length} tenants para receber relatórios.`);

    // 2. Para cada tenant, gerar o relatório e enviar usando a instância do SISTEMA.
    for (const tenant of tenantsToReport) {
      console.log(`Gerando relatório para o tenant: ${tenant.name}`);
      
      const stats = await resultRepository.getDailyStats(tenant.id);
      
      const message = `
*Resumo Diário - ${tenant.name}*
_${new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString('pt-BR')}_

Olá! Aqui está o resumo de ontem:

- *Total de Respostas NPS:* ${stats.totalResponses}
- *Promotores (9-10):* ${stats.promoters}
- *Neutros (7-8):* ${stats.neutrals}
- *Detratores (0-6):* ${stats.detractors}

_Este é um relatório automático do sistema Feedeliza._
      `.trim();

      if (tenant.reportPhoneNumber) {
        // **MUDANÇA CHAVE:** Chamando a nova função de envio do sistema.
        await whatsappService.sendSystemMessage(tenant.reportPhoneNumber, message);
        console.log(`Relatório para "${tenant.name}" enviado com sucesso.`);
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