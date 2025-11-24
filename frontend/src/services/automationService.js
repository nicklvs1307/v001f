import apiAuthenticated from "./apiAuthenticated";

const automationService = {
  getAutomations: () => apiAuthenticated.get("/whatsapp-config/instance"),
  updateAutomations: (data) => apiAuthenticated.put("/whatsapp-config/instance", data),

  // Funções de teste
  testDailyReport: (data) => apiAuthenticated.post("/automations/test/daily-report", data),
  testBirthday: (data) => apiAuthenticated.post("/automations/test/birthday", data),
  testCouponReminder: (data) => apiAuthenticated.post("/automations/test/coupon-reminder", data),
  testRoletaPrize: (data) => apiAuthenticated.post("/automations/test/roleta-prize", data),
};

export default automationService;

