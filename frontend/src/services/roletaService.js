
import apiAuthenticated from './apiAuthenticated';

const API_URL = '/roleta';
const ADMIN_API_URL = '/roletas'; // Rota para admin

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
    const response = await apiAuthenticated.get(ADMIN_API_URL);
    return response.data;
  },

  getRoletaById: async (id) => {
    const response = await apiAuthenticated.get(`${ADMIN_API_URL}/${id}`);
    return response.data;
  },

  createRoleta: async (roletaData) => {
    const response = await apiAuthenticated.post(ADMIN_API_URL, roletaData);
    return response.data;
  },

  updateRoleta: async (id, roletaData) => {
    const response = await apiAuthenticated.put(`${ADMIN_API_URL}/${id}`, roletaData);
    return response.data;
  },

  deleteRoleta: async (id) => {
    const response = await apiAuthenticated.delete(`${ADMIN_API_URL}/${id}`);
    return response.data;
  },
};

export default roletaService;
