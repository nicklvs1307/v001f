const asyncHandler = require('express-async-handler');
const automationService = require('../services/automationService');

const automationController = {
  getAutomations: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const automations = await automationService.getAutomations(tenantId);
    res.json(automations);
  }),

  updateAutomations: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const automations = await automationService.updateAutomations(tenantId, req.body);
    res.json(automations);
  }),
};

module.exports = automationController;
