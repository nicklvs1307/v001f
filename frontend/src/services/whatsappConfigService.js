import apiAuthenticated from './apiAuthenticated';

const whatsappConfigService = {
  // Para Super Admin
  getAllTenantConfigsWithStatus: () => apiAuthenticated.get('/whatsapp-config/superadmin/all-tenants'),
  getTenantConfig: (tenantId) => apiAuthenticated.get(`/whatsapp-config/${tenantId}`),
  saveTenantConfig: (tenantId, data) => apiAuthenticated.post(`/whatsapp-config/${tenantId}`, data),
  superAdminRestartInstance: (tenantId) => apiAuthenticated.put(`/whatsapp-config/superadmin/restart/${tenantId}`),
  superAdminLogoutInstance: (tenantId) => apiAuthenticated.delete(`/whatsapp-config/superadmin/logout/${tenantId}`),
  superAdminDeleteInstance: (tenantId) => apiAuthenticated.delete(`/whatsapp-config/superadmin/delete/${tenantId}`),


  // Para Tenant Admin
  getInstanceConfig: () => apiAuthenticated.get('/whatsapp-config/instance'),
  createInstance: () => apiAuthenticated.post('/whatsapp-config/instance/create'), // Corrigido
  getQrCode: () => apiAuthenticated.post('/whatsapp-config/instance/connect'), // Corrigido e renomeado
  getConnectionInfo: () => apiAuthenticated.get('/whatsapp-config/instance/connection-info'),
  logoutInstance: () => apiAuthenticated.delete('/whatsapp-config/instance/logout'),
  restartInstance: () => apiAuthenticated.put('/whatsapp-config/instance/restart'),
  deleteInstance: () => apiAuthenticated.delete('/whatsapp-config/instance'),
  update: (data) => apiAuthenticated.put('/whatsapp-config/automations', data),
};

export default whatsappConfigService;