import apiAuthenticated from "./apiAuthenticated";

const API_URL = "/recompensas";

const recompensaService = {
  getAll: (activeOnly = false) => apiAuthenticated.get(`${API_URL}${activeOnly ? '?active=true' : ''}`),

  createRecompensa: (data) => apiAuthenticated.post(API_URL, data),

  updateRecompensa: (id, data) => apiAuthenticated.put(`${API_URL}/${id}`, data),

  deleteRecompensa: (id) => apiAuthenticated.delete(`${API_URL}/${id}`),
};

export default recompensaService;