import apiAuthenticated from './apiAuthenticated';

const whatsappConfigService = {
  // Para Super Admin
  getTenantConfig: (tenantId) => apiAuthenticated.get(`/whatsapp-config/${tenantId}`),
  saveTenantConfig: (tenantId, data) => apiAuthenticated.post(`/whatsapp-config/${tenantId}`, data),

  // Para Tenant Admin
  getInstanceConfig: () => apiAuthenticated.get('/whatsapp-config/instance'),
  createInstance: () => apiAuthenticated.post('/whatsapp-config/instance/create'), // Corrigido
  getQrCode: () => apiAuthenticated.post('/whatsapp-config/instance/connect'), // Corrigido e renomeado
  getConnectionInfo: () => apiAuthenticated.get('/whatsapp-config/instance/connection-info'),
  logoutInstance: () => apiAuthenticated.delete('/whatsapp-config/instance/logout'),
  deleteInstance: () => apiAuthenticated.delete('/whatsapp-config/instance'),
};

export default whatsappConfigService;