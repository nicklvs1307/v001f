const cron = require('node-cron');
const deliveryMuchService = require('../services/deliveryMuchService');

// Frequência de 5 minutos
const POLLING_INTERVAL = process.env.DELIVERY_MUCH_POLLING_INTERVAL || '*/5 * * * *';

const deliveryMuchPollingJob = {
    start: () => {
        console.log(`[Delivery Much Polling Job] Scheduling polling to run every ${POLLING_INTERVAL}`);
        cron.schedule(POLLING_INTERVAL, async () => {
            await deliveryMuchService.runPolling();
        }, {
            scheduled: true,
            timezone: 'America/Sao_Paulo'
        });
    },
};

module.exports = deliveryMuchPollingJob;
