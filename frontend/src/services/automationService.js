import apiAuthenticated from "./apiAuthenticated";

const automationService = {
  getAutomations: () => apiAuthenticated.get("/config/whatsapp"), // Endpoint atualizado
  updateAutomations: (data) => apiAuthenticated.put("/config/whatsapp", data), // Endpoint atualizado

  // Novas funções de teste
  testDailyReport: (data) => apiAuthenticated.post("/automations/test/daily-report", data),
  testBirthday: (data) => apiAuthenticated.post("/automations/test/birthday", data),
  testCouponReminder: (data) => apiAuthenticated.post("/automations/test/coupon-reminder", data),
  testRoletaPrize: (data) => apiAuthenticated.post("/automations/test/roleta-prize", data),
};

export default automationService;
