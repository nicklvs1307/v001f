const asyncHandler = require("express-async-handler");
const automationService = require("../services/automationService");

const automationController = {
  getAutomations: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const automations = await automationService.getAutomations(tenantId);
    res.json(automations);
  }),

  updateAutomations: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const automations = await automationService.updateAutomations(
      tenantId,
      req.body,
    );
    res.json(automations);
  }),

  sendDailyReportTest: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const { phoneNumbers } = req.body;
    await automationService.sendDailyReportTest(tenantId, phoneNumbers);
    res
      .status(200)
      .json({ message: "Relatório de teste enviado com sucesso!" });
  }),
};

module.exports = automationController;
