
import apiAuthenticated from './apiAuthenticated';

const API_URL = '/roleta';

const roletaService = {
  spin: async (clientId) => {
    const response = await apiAuthenticated.post(`${API_URL}/spin`, { clientId });
    return response.data;
  },

  getRoletaConfig: async (clientId) => {
    const response = await apiAuthenticated.get(`${API_URL}/config/${clientId}`);
    return response.data;
  },

  getAllRoletas: async () => {
    const response = await apiAuthenticated.get('/roletas');
    return response.data;
  },
};

export default roletaService;
