const cron = require("node-cron");
const { convertToTimeZone, now } = require("../utils/dateUtils");
const {
  startOfDay,
  addDays,
  getMonth,
  getDate,
  endOfDay,
} = require("date-fns");
const whatsappConfigRepository = require("../repositories/whatsappConfigRepository");
const clientRepository = require("../repositories/clientRepository");
const cupomRepository = require("../repositories/cupomRepository");
const recompensaRepository = require("../repositories/recompensaRepository");
const roletaRepository = require("../repositories/roletaRepository");
const whatsappService = require("../services/whatsappService");
const { v4: uuidv4 } = require("uuid");

const birthdayTask = cron.schedule(
  "0 9 * * *",
  async () => {
    // Executa todo dia às 9h da manhã
    console.log("Iniciando job de automação de aniversário...");
    try {
      const configs =
        await whatsappConfigRepository.findAllWithBirthdayAutomationEnabled();

      for (const config of configs) {
        if (
          !config.birthdayAutomationEnabled ||
          !config.birthdayRewardType ||
          !config.birthdayRewardId
        ) {
          continue; // Pula se a automação não estiver habilitada ou sem recompensa configurada
        }

        const today = startOfDay(now());
        const birthdayDate = addDays(today, config.birthdayDaysBefore);

        const clients = await clientRepository.findClientsByBirthdayMonthAndDay(
          getMonth(birthdayDate) + 1,
          getDate(birthdayDate),
          config.tenantId,
        );

        for (const client of clients) {
          try {
            let rewardName = "";
            let cupomCode = "";
            let novoCupom = null;

            // 1. Gerar Cupom
            if (config.birthdayRewardType === "recompensa") {
              const recompensa = await recompensaRepository.findById(
                config.birthdayRewardId,
              );
              if (recompensa) {
                rewardName = recompensa.name;
                cupomCode = uuidv4().substring(0, 8).toUpperCase(); // Gera um código de cupom único
                const expiryDate = endOfDay(
                  addDays(now(), config.birthdayCouponValidityDays),
                );
                novoCupom = await cupomRepository.create({
                  codigo: cupomCode,
                  recompensaId: recompensa.id,
                  clienteId: client.id,
                  tenantId: config.tenantId,
                  dataValidade: expiryDate,
                  dataGeracao: new Date(),
                  status: 'active',
                });
              }
            } else if (config.birthdayRewardType === "roleta") {
              const roleta = await roletaRepository.findById(
                config.birthdayRewardId,
              );
              if (roleta) {
                rewardName = roleta.name; // Ou outro campo relevante da roleta
                cupomCode = uuidv4().substring(0, 8).toUpperCase(); // Gera um código de cupom único
                const expiryDate = endOfDay(
                  addDays(now(), config.birthdayCouponValidityDays),
                );
                novoCupom = await cupomRepository.create({
                  codigo: cupomCode,
                  roletaId: roleta.id,
                  clienteId: client.id,
                  tenantId: config.tenantId,
                  dataValidade: expiryDate,
                  dataGeracao: new Date(),
                  status: 'active',
                });
              }
            }

            // 2. Enviar Mensagem
            if (client.phone && novoCupom) {
              const whatsappConfig =
                await whatsappConfigRepository.findByTenantId(config.tenantId);

              if (whatsappConfig && whatsappConfig.birthdayAutomationEnabled) {
                let message = whatsappConfig.birthdayMessageTemplate;
                message = message.replace(/{{cliente}}/g, client.name);
                message = message.replace(/{{recompensa}}/g, rewardName);
                message = message.replace(/{{cupom}}/g, cupomCode);

                await whatsappService.sendTenantMessage(
                  config.tenantId,
                  client.phone,
                  message,
                );
                console.log(
                  `[BirthdayJob] Mensagem de aniversário enviada para ${client.name} (${client.phone}) do tenant ${config.tenantId}`,
                );
              } else {
                console.log(
                  `[BirthdayJob] As condições para enviar a mensagem de aniversário não foram atendidas para o tenant ${config.tenantId} ou cliente ${client.name}.`,
                );
              }
            }
          } catch (clientError) {
            console.error(`[BirthdayJob] Falha ao processar aniversário para o cliente ${client.id} do tenant ${config.tenantId}:`, clientError);
          }
        }
      }
    } catch (error) {
      console.error("Erro no job de automação de aniversário:", error);
    }
  },
  {
    scheduled: false, // Não inicia automaticamente, será iniciado pelo server.js
    timezone: "America/Sao_Paulo",
  },
);

module.exports = {
  start: () => {
    console.log(
      "Agendador de automação de aniversário iniciado. A tarefa será executada todos os dias às 9:00.",
    );
    birthdayTask.start();
  },
  stop: () => {
    console.log("Agendador de automação de aniversário parado.");
    birthdayTask.stop();
  },
};

