import apiAuthenticated from "./apiAuthenticated";

const recompensaService = {
  getAll: () => apiAuthenticated.get("/recompensas"),
};

export default recompensaService;