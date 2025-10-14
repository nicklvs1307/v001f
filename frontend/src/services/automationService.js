import apiAuthenticated from "./apiAuthenticated";

const automationService = {
  getAutomations: () => apiAuthenticated.get("/automations"),
  updateAutomations: (data) => apiAuthenticated.put("/automations", data),
  sendDailyReportTest: (data) => apiAuthenticated.post("/automations/daily-report/test", data),
};

export default automationService;
