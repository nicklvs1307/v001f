import apiAuthenticated from './apiAuthenticated';

const RECOMPENSA_API_URL = '/recompensas';

const recompensaService = {
  getAllRecompensas: async () => {
    const response = await apiAuthenticated.get(RECOMPENSA_API_URL);
    return response.data;
  },

  getRecompensaById: async (id) => {
    const response = await apiAuthenticated.get(`${RECOMPENSA_API_URL}/${id}`);
    return response.data;
  },

  createRecompensa: async (recompensaData) => {
    const response = await apiAuthenticated.post(RECOMPENSA_API_URL, recompensaData);
    return response.data;
  },

  updateRecompensa: async (id, recompensaData) => {
    const response = await apiAuthenticated.put(`${RECOMPENSA_API_URL}/${id}`, recompensaData);
    return response.data;
  },

  deleteRecompensa: async (id) => {
    const response = await apiAuthenticated.delete(`${RECOMPENSA_API_URL}/${id}`);
    return response.data;
  },
};

export default recompensaService;
