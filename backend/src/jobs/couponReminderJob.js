const cron = require("node-cron");
const { Cupom, Client, Tenant, WhatsappTemplate } = require("../../models");
const { now } = require("../utils/dateUtils");
const { Op } = require("sequelize");
const { format, addDays, startOfDay, endOfDay } = require("date-fns");
const whatsappService = require("../services/whatsappService");

const schedule = "0 9 * * *"; // Todos os dias às 9:00

const task = cron.schedule(
  schedule,
  async () => {
    console.log("[Job] Iniciando verificação de lembretes de cupons...");

    try {
      const templates = await WhatsappTemplate.findAll({
        where: {
          type: "COUPON_REMINDER",
          isEnabled: true,
        },
      });

      console.log(
        `[Job] Templates de lembrete de cupom encontrados: ${templates.length}`,
      );

      if (templates.length === 0) {
        console.log(
          "[Job] Nenhuma automação de lembrete de cupom ativa. Encerrando.",
        );
        return;
      }

      for (const template of templates) {
        const { tenantId, daysBefore, message } = template;
        console.log(
          `[Job] Processando template para o tenant ${tenantId} com daysBefore: ${daysBefore}`,
        );

        if (!daysBefore || daysBefore <= 0) {
          console.log(
            `[Job] Template para o tenant ${tenantId} não tem um daysBefore válido.`,
          );
          continue;
        }

        const todayInZone = now();
        const targetDate = addDays(todayInZone, daysBefore);
        console.log(`[Job] Data alvo para o tenant ${tenantId}: ${targetDate}`);

        const couponsToRemind = await Cupom.findAll({
          where: {
            tenantId,
            status: "active",
            dataValidade: {
              [Op.gte]: startOfDay(targetDate),
              [Op.lt]: endOfDay(targetDate),
            },
          },
          include: [{ model: Client, as: "client", required: true }],
        });

        console.log(
          `[Job] Cupons encontrados para o tenant ${tenantId}: ${couponsToRemind.length}`,
        );

        if (couponsToRemind.length > 0) {
          console.log(
            `[Job] ${couponsToRemind.length} cupons encontrados para enviar lembrete para o tenant ${tenantId}.`,
          );
        }

        for (const coupon of couponsToRemind) {
          const client = coupon.client;
          if (client && client.phone) {
            const personalizedMessage = message
              .replace(/{{nome_cliente}}/g, client.name)
              .replace(/{{codigo_cupom}}/g, coupon.codigo)
              .replace(
                /{{data_validade}}/g,
                format(new Date(coupon.dataValidade), "dd/MM/yyyy"),
              );

            try {
              await whatsappService.sendTenantMessage(
                tenantId,
                client.phone,
                personalizedMessage,
              );
            } catch (err) {
              console.error(
                `[Job] Falha ao enviar lembrete para ${client.phone} do tenant ${tenantId}:`,
                err.message,
              );
            }
          }
        }
      }
    } catch (error) {
      console.error(
        "[Job] Erro crítico ao executar o job de lembrete de cupons:",
        error,
      );
    }

    console.log("[Job] Verificação de lembretes de cupons concluída.");
  },
  {
    scheduled: false,
    timezone: "America/Sao_Paulo",
  },
);

module.exports = {
  start: () => {
    console.log(
      "Agendador de lembrete de cupons iniciado. A tarefa será executada todos os dias às 9:00.",
    );
    task.start();
  },
  stop: () => {
    console.log("Agendador de lembrete de cupons parado.");
    task.stop();
  },
};
