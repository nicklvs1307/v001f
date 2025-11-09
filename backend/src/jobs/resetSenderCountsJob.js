const cron = require('node-cron');
const SenderPoolService = require('../services/senderPoolService');

// Run once a day at midnight
const resetSenderCountsJob = cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled job: Reset Sender Daily Counts');
  try {
    const senderPoolService = new SenderPoolService();
    await senderPoolService.resetDailyCounts();
  } catch (error) {
    console.error('Error running resetSenderCountsJob:', error);
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: "America/Sao_Paulo"
});

module.exports = resetSenderCountsJob;
