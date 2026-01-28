const cron = require("node-cron");
const { Op } = require("sequelize");
const { DeliveryOrder } = require("../../models");
const surveyTriggerService = require("../services/surveyTriggerService");

// Roda a cada minuto
const JOB_SCHEDULE = "* * * * *";

const postSaleSurveyJob = {
  start: () => {
    console.log("[Post-Sale Survey Job] Iniciando agendamento de pesquisas...");

    cron.schedule(
      JOB_SCHEDULE,
      async () => {
        try {
          const now = new Date();

          // Buscar pedidos agendados para agora ou antes, e que ainda não foram processados
          const pendingOrders = await DeliveryOrder.findAll({
            where: {
              surveyStatus: "SCHEDULED",
              surveyScheduledAt: {
                [Op.lte]: now, // Menor ou igual a agora
              },
            },
            limit: 50, // Processar em lotes para não sobrecarregar
          });

          if (pendingOrders.length > 0) {
            console.log(
              `[Post-Sale Survey Job] Encontrados ${pendingOrders.length} pedidos pendentes de pesquisa.`,
            );

            for (const order of pendingOrders) {
              try {
                // Chama o método original que faz o envio real
                await surveyTriggerService.sendSatisfactionSurvey(
                  order.clientId,
                  order.tenantId,
                  order.id,
                );
              } catch (innerError) {
                console.error(
                  `[Post-Sale Survey Job] Falha ao processar pedido ${order.id}:`,
                  innerError.message,
                );
                // O status ERROR já é setado dentro do sendSatisfactionSurvey em caso de falha
              }
            }
          }
        } catch (error) {
          console.error("[Post-Sale Survey Job] Erro geral no job:", error);
        }
      },
      {
        scheduled: true,
        timezone: "America/Sao_Paulo",
      },
    );
  },
};

module.exports = postSaleSurveyJob;
