const cron = require("node-cron");
const { format, subMonths, startOfMonth, endOfMonth, isSameMonth } = require("date-fns");
const { ptBR } = require("date-fns/locale");
const { formatInTimeZone } = require("../utils/dateUtils");
const whatsappService = require("../services/whatsappService");
const whatsappConfigRepository = require("../repositories/whatsappConfigRepository");
const tenantRepository = require("../repositories/tenantRepository");
const dashboardRepository = require("../repositories/dashboardRepository");

// Rodando a cada 4 horas para garantir redundância (todo dia 1º a partir das 08:00 AM)
const schedule = "0 */4 * * *";

const monthlyReportTask = cron.schedule(
  schedule,
  async () => {
    console.log("[Monthly Report Job] Iniciando verificação de relatórios mensais...");

    try {
      const now = new Date();
      const dayOfMonth = parseInt(formatInTimeZone(now, "d"));
      const hour = parseInt(formatInTimeZone(now, "HH"));

      // Só envia no dia 1º a partir das 08:00 AM
      if (dayOfMonth !== 1 || hour < 8) {
        console.log("[Monthly Report Job] Fora do dia ou horário de envio. Pulando...");
        return;
      }

      const configsToReport = await whatsappConfigRepository.findAllWithMonthlyReportEnabled();

      if (!configsToReport || configsToReport.length === 0) {
        console.log("[Monthly Report Job] Nenhuma configuração com relatório mensal ativado.");
        return;
      }

      for (const config of configsToReport) {
        try {
          // Verificar se já enviamos o relatório mensal este mês
          if (config.lastMonthlyReportSentAt) {
            const lastSent = new Date(config.lastMonthlyReportSentAt);
            if (isSameMonth(lastSent, now)) {
              console.log(`[Monthly Report Job] Relatório mensal já enviado para tenant ${config.tenantId}.`);
              continue;
            }
          }

          console.log(`[Monthly Report Job] Gerando relatório mensal para tenant: ${config.tenantId}`);

          const tenant = await tenantRepository.getTenantById(config.tenantId);
          if (!tenant) continue;

          const lastMonth = subMonths(now, 1);
          const startOfLastMonth = startOfMonth(lastMonth);
          const endOfLastMonth = endOfMonth(lastMonth);

          const [monthlySummary, surveySummaries] = await Promise.all([
            dashboardRepository.getSummary(config.tenantId, startOfLastMonth, endOfLastMonth),
            dashboardRepository.getSummaryBySurvey(config.tenantId, startOfLastMonth, endOfLastMonth)
          ]);

          const formattedMonth = format(lastMonth, "MMMM 'de' yyyy", { locale: ptBR });
          const isoDate = format(endOfLastMonth, "yyyy-MM-dd");

          const baseUrl = process.env.FRONTEND_URL || "https://loyalfood.towersfy.com";
          const reportUrl = `${baseUrl}/relatorios/mensal?date=${isoDate}`;

          let message =
            `*Relatório Mensal ${tenant.name}*\n\n` +
            `Aqui está o resumo da experiência dos seus clientes em ${formattedMonth}!\n` +
            `📊 *Total de respostas:* ${monthlySummary.totalResponses}\n` +
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

          message += `🔗 Acesse o relatório completo: ${reportUrl}`;

          const phoneNumbers = config.reportPhoneNumbers.split(",").map(p => p.trim()).filter(p => p);
          let sentSuccessfully = false;

          for (const phoneNumber of phoneNumbers) {
            try {
              await whatsappService.sendTenantMessage(config.tenantId, phoneNumber, message);
              console.log(`[Monthly Report Job] Sucesso para ${tenant.name} (${phoneNumber}).`);
              sentSuccessfully = true;
            } catch (error) {
              console.error(`[Monthly Report Job] Falha para ${phoneNumber}: ${error.message}`);
            }
          }

          if (sentSuccessfully) {
            await whatsappConfigRepository.updateReportSentAt(config.id, "monthly");
          }

        } catch (tenantError) {
          console.error(`[Monthly Report Job] Erro no tenant ${config.tenantId}:`, tenantError);
        }
      }

      console.log("[Monthly Report Job] Verificação concluída.");
    } catch (error) {
      console.error("[Monthly Report Job] Erro crítico:", error);
    }
  },
  {
    scheduled: false,
    timezone: "America/Sao_Paulo",
  },
);

module.exports = {
  start: () => {
    console.log("[Monthly Report Job] Agendador iniciado (redundância a cada 4 horas).");
    monthlyReportTask.start();
  },
  stop: () => monthlyReportTask.stop(),
};
