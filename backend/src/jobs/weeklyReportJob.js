const cron = require("node-cron");
const { format, subWeeks, startOfWeek, endOfWeek, isSameWeek } = require("date-fns");
const { formatInTimeZone } = require("../utils/dateUtils");
const whatsappService = require("../services/whatsappService");
const whatsappConfigRepository = require("../repositories/whatsappConfigRepository");
const tenantRepository = require("../repositories/tenantRepository");
const dashboardRepository = require("../repositories/dashboardRepository");

// Rodando a cada hora para garantir redundância (toda segunda-feira a partir das 08:00 AM)
const schedule = "0 * * * *";

const weeklyReportTask = cron.schedule(
  schedule,
  async () => {
    console.log("[Weekly Report Job] Iniciando verificação de relatórios semanais...");

    try {
      const { now: getZonedNow } = require("../utils/dateUtils");
      const now = getZonedNow();
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Converter 0 (Dom) para 7 se necessário, ou usar direto se a lógica for baseada em 1-7
      const hour = now.getHours();

      // Só envia na segunda-feira (1) a partir das 08:00 AM
      if (dayOfWeek !== 1 || hour < 8) {
        console.log("[Weekly Report Job] Fora do dia ou horário de envio. Pulando...");
        return;
      }

      const configsToReport = await whatsappConfigRepository.findAllWithWeeklyReportEnabled();

      if (!configsToReport || configsToReport.length === 0) {
        console.log("[Weekly Report Job] Nenhuma configuração com relatório semanal ativado.");
        return;
      }

      for (const config of configsToReport) {
        try {
          // Verificar se já enviamos o relatório semanal esta semana
          if (config.lastWeeklyReportSentAt) {
            const lastSent = new Date(config.lastWeeklyReportSentAt);
            if (isSameWeek(lastSent, now, { weekStartsOn: 1 })) {
              console.log(`[Weekly Report Job] Relatório semanal já enviado para tenant ${config.tenantId}.`);
              continue;
            }
          }

          console.log(`[Weekly Report Job] Gerando relatório semanal para tenant: ${config.tenantId}`);

          const tenant = await tenantRepository.getTenantById(config.tenantId);
          if (!tenant) continue;

          const lastWeek = subWeeks(now, 1);
          const { convertToUtc } = require("../utils/dateUtils");
          const startOfLastWeek = convertToUtc(startOfWeek(lastWeek, { weekStartsOn: 1 }));
          const endOfLastWeek = convertToUtc(endOfWeek(lastWeek, { weekStartsOn: 1 }));

          const [weeklySummary, surveySummaries] = await Promise.all([
            dashboardRepository.getSummary(config.tenantId, startOfLastWeek, endOfLastWeek),
            dashboardRepository.getSummaryBySurvey(config.tenantId, startOfLastWeek, endOfLastWeek)
          ]);

          const formattedStartDate = format(startOfLastWeek, "dd/MM/yyyy");
          const formattedEndDate = format(endOfLastWeek, "dd/MM/yyyy");
          const isoDate = format(endOfLastWeek, "yyyy-MM-dd");

          const baseUrl = process.env.FRONTEND_URL || "https://loyalfood.towersfy.com";
          const reportUrl = `${baseUrl}/relatorios/semanal?date=${isoDate}`;

          let message =
            `*Relatório Semanal ${tenant.name}*\n\n` +
            `Aqui está o resumo da semana de ${formattedStartDate} a ${formattedEndDate}!\n` +
            `📊 *Total de respostas:* ${weeklySummary.totalResponses}\n` +
            `🟢 Promotores: ${weeklySummary.nps.promoters}\n` +
            `🟡 Neutros: ${weeklySummary.nps.neutrals}\n` +
            `🔴 Detratores: ${weeklySummary.nps.detractors}\n\n`;

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
              console.log(`[Weekly Report Job] Sucesso para ${tenant.name} (${phoneNumber}).`);
              sentSuccessfully = true;
            } catch (error) {
              console.error(`[Weekly Report Job] Falha para ${phoneNumber}: ${error.message}`);
            }
          }

          if (sentSuccessfully) {
            await whatsappConfigRepository.updateReportSentAt(config.id, "weekly");
          }

        } catch (tenantError) {
          console.error(`[Weekly Report Job] Erro no tenant ${config.tenantId}:`, tenantError);
        }
      }

      console.log("[Weekly Report Job] Verificação concluída.");
    } catch (error) {
      console.error("[Weekly Report Job] Erro crítico:", error);
    }
  },
  {
    scheduled: false,
    timezone: "America/Sao_Paulo",
  },
);

module.exports = {
  start: () => {
    console.log("[Weekly Report Job] Agendador iniciado (redundância horária).");
    weeklyReportTask.start();
  },
  stop: () => weeklyReportTask.stop(),
};
