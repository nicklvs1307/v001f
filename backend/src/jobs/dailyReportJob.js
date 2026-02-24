const cron = require("node-cron");
const { format, subDays, isSameDay } = require("date-fns");
const {
  formatInTimeZone,
  convertToUtc,
} = require("../utils/dateUtils");
const whatsappService = require("../services/whatsappService");
const whatsappConfigRepository = require("../repositories/whatsappConfigRepository");
const tenantRepository = require("../repositories/tenantRepository");
const dashboardRepository = require("../repositories/dashboardRepository");

// Cron rodando a cada 15 minutos para garantir redundância caso o servidor falhe no minuto exato.
// Ele só enviará o relatório se ainda não tiver sido enviado hoje (após as 08:00 AM).
const schedule = "*/15 * * * *";

const dailyReportTask = cron.schedule(
  schedule,
  async () => {
    console.log("[Daily Report Job] Iniciando verificação de relatórios diários...");

    try {
      const { now: getZonedNow } = require("../utils/dateUtils");
      const now = getZonedNow();
      const hour = now.getHours();

      // Só envia relatórios a partir das 08:00 AM (Horário de Brasília)
      if (hour < 8) {
        console.log("[Daily Report Job] Fora do horário de envio (antes das 08:00 AM). Pulando...");
        return;
      }

      const configsToReport = await whatsappConfigRepository.findAllWithDailyReportEnabled();

      if (!configsToReport || configsToReport.length === 0) {
        console.log("[Daily Report Job] Nenhuma configuração com relatório diário ativado.");
        return;
      }

      for (const config of configsToReport) {
        try {
          // Verificar se já enviamos o relatório diário hoje
          if (config.lastDailyReportSentAt) {
            const lastSent = new Date(config.lastDailyReportSentAt);
            if (isSameDay(lastSent, now)) {
              console.log(`[Daily Report Job] Relatório já enviado hoje para tenant ${config.tenantId}.`);
              continue;
            }
          }

          console.log(`[Daily Report Job] Gerando relatório para tenant: ${config.tenantId}`);

          const tenant = await tenantRepository.getTenantById(config.tenantId);
          if (!tenant) continue;

          // Ontem (Horário de Brasília)
          const yesterday = subDays(now, 1);
          const { getStartOfDayUTC, getEndOfDayUTC } = require("../utils/dateUtils");
          
          const startOfYesterdayZoned = getStartOfDayUTC(yesterday);
          const endOfYesterdayZoned = getEndOfDayUTC(yesterday);

          // Anteontem (para comparação)
          const twoDaysAgo = subDays(now, 2);
          const startOfTwoDaysAgoZoned = getStartOfDayUTC(twoDaysAgo);
          const endOfTwoDaysAgoZoned = getEndOfDayUTC(twoDaysAgo);

          const [yesterdaySummary, twoDaysAgoSummary, surveySummaries] = await Promise.all([
            dashboardRepository.getSummary(config.tenantId, startOfYesterdayZoned, endOfYesterdayZoned),
            dashboardRepository.getSummary(config.tenantId, startOfTwoDaysAgoZoned, endOfTwoDaysAgoZoned),
            dashboardRepository.getSummaryBySurvey(config.tenantId, startOfYesterdayZoned, endOfYesterdayZoned)
          ]);

          const diff = yesterdaySummary.totalResponses - twoDaysAgoSummary.totalResponses;
          const diffArrow = diff > 0 ? "⬆" : diff < 0 ? "⬇" : "➖";
          const diffText = `(${diffArrow} ${Math.abs(diff)} em relação a ${format(twoDaysAgo, "dd/MM/yyyy")})`;

          const formattedDate = format(yesterday, "dd/MM/yyyy");
          const isoDate = format(yesterday, "yyyy-MM-dd");
          const baseUrl = process.env.FRONTEND_URL || "https://loyalfood.towersfy.com";
          const reportUrl = `${baseUrl}/relatorios/diario?date=${isoDate}`;

          let message =
            `*Relatório Diário ${tenant.name}*\n\n` +
            `Aqui está o resumo da experiência dos seus clientes no dia ${formattedDate}!\n` +
            `📊 *Total de respostas:* ${yesterdaySummary.totalResponses} ${diffText}\n` +
            `🟢 Promotores: ${yesterdaySummary.nps.promoters}\n` +
            `🟡 Neutros: ${yesterdaySummary.nps.neutrals}\n` +
            `🔴 Detratores: ${yesterdaySummary.nps.detractors}\n\n`;

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

          message += `🔗 Acesse o painel: ${reportUrl}`;

          const phoneNumbers = config.reportPhoneNumbers.split(",").map(p => p.trim()).filter(p => p);
          let sentSuccessfully = false;

          for (const phoneNumber of phoneNumbers) {
            try {
              await whatsappService.sendTenantMessage(config.tenantId, phoneNumber, message);
              console.log(`[Daily Report Job] Sucesso para ${tenant.name} (${phoneNumber}).`);
              sentSuccessfully = true;
            } catch (error) {
              console.error(`[Daily Report Job] Falha ao enviar para ${phoneNumber}: ${error.message}`);
            }
          }

          if (sentSuccessfully) {
            await whatsappConfigRepository.updateReportSentAt(config.id, "daily");
          }

        } catch (tenantError) {
          console.error(`[Daily Report Job] Erro no tenant ${config.tenantId}:`, tenantError);
        }
      }

      console.log("[Daily Report Job] Verificação concluída.");
    } catch (error) {
      console.error("[Daily Report Job] Erro crítico:", error);
    }
  },
  {
    scheduled: false,
    timezone: "America/Sao_Paulo",
  },
);

module.exports = {
  start: () => {
    console.log("[Daily Report Job] Agendador iniciado (redundância a cada 15 min).");
    dailyReportTask.start();
  },
  stop: () => dailyReportTask.stop(),
};
