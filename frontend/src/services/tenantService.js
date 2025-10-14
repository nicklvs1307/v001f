import apiAuthenticated from './apiAuthenticated';

const tenantService = {
  getMe: () => apiAuthenticated.get('/tenants/me'),
  update: (data) => apiAuthenticated.put('/tenants/me', data),
  getAllTenants: () => apiAuthenticated.get('/tenants'),
};

export default tenantService;

export default tenantService;