import apiAuthenticated from "./apiAuthenticated";

const automationService = {
  getAutomations: () => apiAuthenticated.get("/automations"),
  updateAutomations: (data) => apiAuthenticated.put("/automations", data),
};

export default automationService;
