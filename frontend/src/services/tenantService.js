import apiAuthenticated from './apiAuthenticated';

const tenantService = {
  getMe: () => apiAuthenticated.get('/tenants/me'),
  update: (data) => apiAuthenticated.put('/tenants/me', data),
  getAllTenants: () => apiAuthenticated.get('/tenants'),
  createTenant: (data) => apiAuthenticated.post('/tenants', data),
  updateTenant: (id, data) => apiAuthenticated.put(`/tenants/${id}`, data),
  deleteTenant: (id) => apiAuthenticated.delete(`/tenants/${id}`),
};

export default tenantService;
