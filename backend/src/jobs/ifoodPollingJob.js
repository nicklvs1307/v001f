const cron = require("node-cron");
const ifoodService = require("../services/ifoodService"); // Assumindo que ifoodService está em ../services/ifoodService

// Definir a frequência do polling (Recomendado pelo iFood: a cada 30 segundos)
const POLLING_INTERVAL = "*/30 * * * * *"; // A cada 30 segundos

const ifoodPollingJob = {
  start: () => {
    console.log(
      `[iFood Polling Job] Scheduling iFood polling to run every 30 seconds`,
    );
    cron.schedule(
      POLLING_INTERVAL,
      async () => {
        // Adicionar controle de execução para evitar sobreposição se o request demorar
        await ifoodService.runIfoodPolling();
      },
      {
        scheduled: true,
        timezone: "America/Sao_Paulo",
      },
    );
  },
};

module.exports = ifoodPollingJob;
