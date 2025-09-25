import apiAuthenticated from './apiAuthenticated';

const configService = {
  getTenantConfig: async () => {
    const response = await apiAuthenticated.get('/config/tenant');
    return response.data;
  },

  updateTenantConfig: async (configData) => {
    const response = await apiAuthenticated.put('/config/tenant', configData);
    return response.data;
  },

  uploadTenantLogo: async (tenantId, file) => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiAuthenticated.post(`/tenants/${tenantId}/upload-logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default configService;