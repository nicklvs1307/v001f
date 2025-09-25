
import apiAuthenticated from './apiAuthenticated';

const API_URL = '/roleta-premios';

const roletaPremioService = {
  getAllPremios: async () => {
    const response = await apiAuthenticated.get(API_URL);
    return response.data;
  },

  createPremio: async (premioData) => {
    const response = await apiAuthenticated.post(API_URL, premioData);
    return response.data;
  },

  updatePremio: async (id, premioData) => {
    const response = await apiAuthenticated.put(`${API_URL}/${id}`, premioData);
    return response.data;
  },

  deletePremio: async (id) => {
    const response = await apiAuthenticated.delete(`${API_URL}/${id}`);
    return response.data;
  },
};

export default roletaPremioService;
