import apiAuthenticated from './apiAuthenticated';

const RECOMPENSA_API_URL = '/recompensas';

const recompensaService = {
  create: async (recompensaData) => {
    const response = await apiAuthenticated.post(RECOMPENSA_API_URL, recompensaData);
    return response.data;
  },

  getAll: async (activeOnly = false) => {
    const response = await apiAuthenticated.get(RECOMPENSA_API_URL, { params: { active: activeOnly } });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiAuthenticated.get(`${RECOMPENSA_API_URL}/${id}`);
    return response.data;
  },

  update: async (id, recompensaData) => {
    const response = await apiAuthenticated.put(`${RECOMPENSA_API_URL}/${id}`, recompensaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiAuthenticated.delete(`${RECOMPENSA_API_URL}/${id}`);
    return response.data;
  },

  getRewardsDashboard: async () => {
    const response = await apiAuthenticated.get(`${RECOMPENSA_API_URL}/dashboard`);
    return response.data;
  },
};

export default recompensaService;