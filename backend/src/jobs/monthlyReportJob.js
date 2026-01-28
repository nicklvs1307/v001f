const cron = require("node-cron");
const { format, subMonths, startOfMonth, endOfMonth } = require("date-fns");
const { ptBR } = require("date-fns/locale");
const { now } = require("../utils/dateUtils");
const whatsappService = require("../services/whatsappService");
const whatsappConfigRepository = require("../repositories/whatsappConfigRepository");
const tenantRepository = require("../repositories/tenantRepository");
const dashboardRepository = require("../repositories/dashboardRepository");

const schedule = "0 8 1 * *"; // Every 1st day of the month at 8:00 AM

const monthlyReportTask = cron.schedule(
  schedule,
  async () => {
    console.log("Executando a tarefa de relatório mensal...");

    try {
      const configsToReport =
        await whatsappConfigRepository.findAllWithMonthlyReportEnabled();

      if (!configsToReport || configsToReport.length === 0) {
        console.log(
          "Nenhuma configuração de WhatsApp com relatório mensal ativado encontrada.",
        );
        return;
      }

      console.log(
        `Encontradas ${configsToReport.length} configurações para receber relatórios mensais.`,
      );

      for (const config of configsToReport) {
        try {
          console.log(
            `Gerando relatório mensal para o tenantId: ${config.tenantId}`,
          );

          const tenant = await tenantRepository.getTenantById(config.tenantId);
          if (!tenant) {
            console.warn(
              `Tenant ${config.tenantId} não encontrado para a configuração de relatório.`,
            );
            continue;
          }

          const zonedNow = now();
          const lastMonth = subMonths(zonedNow, 1);
          const startOfLastMonth = startOfMonth(lastMonth);
          const endOfLastMonth = endOfMonth(lastMonth);

          const monthlySummary = await dashboardRepository.getSummary(
            config.tenantId,
            startOfLastMonth,
            endOfLastMonth,
          );

          const surveySummaries = await dashboardRepository.getSummaryBySurvey(
            config.tenantId,
            startOfLastMonth,
            endOfLastMonth,
          );

          const formattedMonth = format(lastMonth, "MMMM 'de' yyyy", {
            locale: ptBR,
          });
          const isoDate = format(endOfLastMonth, "yyyy-MM-dd");

          const baseUrl =
            process.env.FRONTEND_URL || "https://loyalfood.towersfy.com";
          const reportUrl = `${baseUrl}/relatorios/mensal?date=${isoDate}`;

          let message =
            `*Relatório Mensal ${tenant.name}*\n\n` +
            `Aqui está o resumo da experiência dos seus clientes em ${formattedMonth}!\n` +
            `📊 *Total Geral de respostas:* ${monthlySummary.totalResponses}\n` +
            `🟢 Promotores: ${monthlySummary.nps.promoters}\n` +
            `🟡 Neutros: ${monthlySummary.nps.neutrals}\n` +
            `🔴 Detratores: ${monthlySummary.nps.detractors}\n\n`;

          if (surveySummaries && surveySummaries.length > 0) {
            message += `*Detalhamento por Pesquisa:*\n`;
            surveySummaries.forEach((s) => {
              message +=
                `\n📋 _${s.surveyTitle}_\n` +
                `Respostas: ${s.totalResponses}\n` +
                `🟢 ${s.nps.promoters} | 🟡 ${s.nps.neutrals} | 🔴 ${s.nps.detractors}\n`;
            });
            message += `\n`;
          }

          message += `🔗 Para acessar o relatório completo, visite ${reportUrl}`;

          const phoneNumbers = config.reportPhoneNumbers
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p);
          for (const phoneNumber of phoneNumbers) {
            try {
              await whatsappService.sendTenantMessage(
                config.tenantId,
                phoneNumber,
                message,
              );
              console.log(
                `Relatório mensal para "${tenant.name}" enviado para ${phoneNumber}.`,
              );
            } catch (error) {
              console.error(
                `Falha ao enviar relatório mensal para o número ${phoneNumber} do tenant ${config.tenantId}:`,
                error.message,
              );
            }
          }
        } catch (tenantError) {
          console.error(
            `Falha ao gerar relatório mensal para o tenant ${config.tenantId}:`,
            tenantError,
          );
        }
      }

      console.log("Tarefa de relatório mensal concluída.");
    } catch (error) {
      console.error("Erro ao executar a tarefa de relatório mensal:", error);
    }
  },
  {
    scheduled: false,
    timezone: "America/Sao_Paulo",
  },
);

module.exports = {
  start: () => {
    console.log(
      "Agendador de relatório mensal iniciado. A tarefa será executada todo dia 1º, às 8:00.",
    );
    monthlyReportTask.start();
  },
  stop: () => {
    console.log("Agendador de relatório mensal parado.");
    monthlyReportTask.stop();
  },
};
