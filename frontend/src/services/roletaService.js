import apiAuthenticated from "./apiAuthenticated";

const roletaService = {
  getAll: () => apiAuthenticated.get("/roletas"),
  getRoletaById: (id) => apiAuthenticated.get(`/roletas/${id}`),
  createRoleta: (data) => apiAuthenticated.post("/roletas", data),
  updateRoleta: (id, data) => apiAuthenticated.put(`/roletas/${id}`, data),
  deleteRoleta: (id) => apiAuthenticated.delete(`/roletas/${id}`),
};

export default roletaService;