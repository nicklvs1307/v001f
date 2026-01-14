const cron = require('node-cron');
const ifoodService = require('../services/ifoodService'); // Assumindo que ifoodService está em ../services/ifoodService

// Definir a frequência do polling (ex: a cada 5 minutos)
// A frequência deve ser cuidadosamente escolhida para não sobrecarregar a API do iFood
// e estar em conformidade com as políticas de uso da API.
const POLLING_INTERVAL = process.env.IFOOD_POLLING_INTERVAL || '*/5 * * * *'; // A cada 5 minutos por padrão

const ifoodPollingJob = {
    start: () => {
        console.log(`[iFood Polling Job] Scheduling iFood polling to run every ${POLLING_INTERVAL}`);
        cron.schedule(POLLING_INTERVAL, async () => {
            await ifoodService.runIfoodPolling();
        }, {
            scheduled: true,
            timezone: 'America/Sao_Paulo' // Ou o timezone adequado para o servidor/negócio
        });
    },
};

module.exports = ifoodPollingJob;
