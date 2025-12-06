const cron = require("node-cron");
const { format, subWeeks, startOfWeek, endOfWeek } = require("date-fns");
const { now } = require("../utils/dateUtils");
const whatsappService = require("../services/whatsappService");
const whatsappConfigRepository = require("../repositories/whatsappConfigRepository");
const tenantRepository = require("../repositories/tenantRepository");
const dashboardRepository = require("../repositories/dashboardRepository");

const schedule = "0 8 * * 1"; // Every Monday at 8:00 AM

const weeklyReportTask = cron.schedule(
  schedule,
  async () => {
    console.log("Executando a tarefa de relatório semanal...");

    try {
      const configsToReport =
        await whatsappConfigRepository.findAllWithWeeklyReportEnabled();

      if (!configsToReport || configsToReport.length === 0) {
        console.log(
          "Nenhuma configuração de WhatsApp com relatório semanal ativado encontrada.",
        );
        return;
      }

      console.log(
        `Encontradas ${configsToReport.length} configurações para receber relatórios semanais.`, 
      );

      for (const config of configsToReport) {
        try {
          console.log(`Gerando relatório semanal para o tenantId: ${config.tenantId}`);

          const tenant = await tenantRepository.getTenantById(config.tenantId);
          if (!tenant) {
            console.warn(
              `Tenant ${config.tenantId} não encontrado para a configuração de relatório.`, 
            );
            continue;
          }

          const zonedNow = now();
          const lastWeek = subWeeks(zonedNow, 1);
          const startOfLastWeek = startOfWeek(lastWeek, { weekStartsOn: 1 }); // Monday
          const endOfLastWeek = endOfWeek(lastWeek, { weekStartsOn: 1 });   // Sunday

          const weeklySummary = await dashboardRepository.getSummary(
            config.tenantId,
            startOfLastWeek,
            endOfLastWeek,
          );

          const formattedStartDate = format(startOfLastWeek, "dd/MM/yyyy");
          const formattedEndDate = format(endOfLastWeek, "dd/MM/yyyy");
          const isoDate = format(endOfLastWeek, "yyyy-MM-dd");
          
          const baseUrl =
            process.env.FRONTEND_URL || "https://loyalfood.towersfy.com";
          const reportUrl = `${baseUrl}/relatorios/semanal?date=${isoDate}`;

          const message =
            `*Relatório Semanal ${tenant.name}*\n\n` +
            `Aqui está o resumo da experiência dos seus clientes na semana de ${formattedStartDate} a ${formattedEndDate}!\n` +
            `📊 Total de respostas: ${weeklySummary.totalResponses}\n` +
            `🟢 Número de Promotores: ${weeklySummary.nps.promoters}\n` +
            `🟡 Número de Neutros: ${weeklySummary.nps.neutrals}\n` +
            `🔴 Número de Detratores: ${weeklySummary.nps.detractors}\n\n` +
            `🔗 Para acessar o relatório completo, visite ${reportUrl}`;

          const phoneNumbers = config.reportPhoneNumbers
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p);
          for (const phoneNumber of phoneNumbers) {
            await whatsappService.sendTenantMessage(
              config.tenantId,
              phoneNumber,
              message,
            );
            console.log(
              `Relatório semanal para "${tenant.name}" enviado para ${phoneNumber}.`,
            );
          }
        } catch (tenantError) {
          console.error(
            `Falha ao gerar relatório semanal para o tenant ${config.tenantId}:`,
            tenantError,
          );
        }
      }

      console.log("Tarefa de relatório semanal concluída.");
    } catch (error) {
      console.error("Erro ao executar a tarefa de relatório semanal:", error);
    }
  },
  {
    scheduled: false,
    timezone: "America/Sao_Paul o",
  },
);

module.exports = {
  start: () => {
    console.log(
      "Agendador de relatório semanal iniciado. A tarefa será executada toda segunda-feira às 8:00.",
    );
    weeklyReportTask.start();
  },
  stop: () => {
    console.log("Agendador de relatório semanal parado.");
    weeklyReportTask.stop();
  },
};
