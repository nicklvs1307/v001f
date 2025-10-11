// src/services/campanhaService.js
import apiAuthenticated from './apiAuthenticated';

const campanhaService = {
  getAll: (tenantId) => apiAuthenticated.get(`/campanhas?tenantId=${tenantId}`),
  getById: (id) => apiAuthenticated.get(`/campanhas/${id}`),
  create: (data) => apiAuthenticated.post('/campanhas', data),
  update: (id, data) => apiAuthenticated.put(`/campanhas/${id}`, data),
  delete: (id) => apiAuthenticated.delete(`/campanhas/${id}`),
  process: (id) => apiAuthenticated.post(`/campanhas/${id}/process`),
};

export default campanhaService;
