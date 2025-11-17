const cron = require("node-cron");
const { convertToZonedTime } = require("../utils/dateUtils");
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

const birthdayAutomationJob = cron.schedule(
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

        const today = startOfDay(convertToZonedTime(new Date()));
        const birthdayDate = addDays(today, config.birthdayDaysBefore);

        const clients = await clientRepository.findClientsByBirthdayMonthAndDay(
          getMonth(birthdayDate) + 1,
          getDate(birthdayDate),
          config.tenantId,
        );

        for (const client of clients) {
          let rewardName = "";
          let cupomCode = "";

          // 1. Gerar Cupom
          if (config.birthdayRewardType === "recompensa") {
            const recompensa = await recompensaRepository.findById(
              config.birthdayRewardId,
            );
            if (recompensa) {
              rewardName = recompensa.name;
              cupomCode = uuidv4().substring(0, 8).toUpperCase(); // Gera um código de cupom único
              const expiryDate = endOfDay(
                addDays(
                  convertToZonedTime(new Date()),
                  config.birthdayCouponValidityDays,
                ),
              );
              await cupomRepository.create({
                code: cupomCode,
                recompensaId: recompensa.id,
                clientId: client.id,
                tenantId: config.tenantId,
                expiresAt: expiryDate,
                isUsed: false,
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
                addDays(
                  convertToZonedTime(new Date()),
                  config.birthdayCouponValidityDays,
                ),
              );
              await cupomRepository.create({
                code: cupomCode,
                recompensaId: null, // Roleta não tem recompensaId diretamente
                roletaId: roleta.id,
                clientId: client.id,
                tenantId: config.tenantId,
                expiresAt: expiryDate,
                isUsed: false,
              });
            }
          }

          // 2. Enviar Mensagem
          if (client.phone && cupomCode) {
            let message = config.birthdayMessageTemplate;
            message = message.replace(/{{cliente}}/g, client.name);
            message = message.replace(/{{recompensa}}/g, rewardName);
            message = message.replace(/{{cupom}}/g, cupomCode);

            await whatsappService.sendTenantMessage(
              config.tenantId,
              client.phone,
              message,
            );
            console.log(
              `Mensagem de aniversário enviada para ${client.name} (${client.phone}) do tenant ${config.tenantId}`,
            );
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

module.exports = birthdayAutomationJob;
