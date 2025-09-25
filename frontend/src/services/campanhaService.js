// src/services/campanhaService.js
import apiAuthenticated from './apiAuthenticated';

const campanhaService = {
  getAll: (tenantId) => apiAuthenticated.get(`/campanhas?tenantId=${tenantId}`),
  create: (data) => apiAuthenticated.post('/campanhas', data),
  process: (id) => apiAuthenticated.post(`/campanhas/${id}/process`),
  // Adicione outros métodos como getById, update, delete se necessário
};

export default campanhaService;
