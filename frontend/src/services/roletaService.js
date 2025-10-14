import apiAuthenticated from "./apiAuthenticated";

const roletaService = {
  getAll: () => apiAuthenticated.get("/roletas"),
};

export default roletaService;