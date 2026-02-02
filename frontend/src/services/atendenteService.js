import apiAuthenticated from './apiAuthenticated';

const ATENDENTE_API_URL = '/atendentes';

const atendenteService = {
  getAllAtendentes: async (tenantId = null) => {
    try {
      const params = tenantId ? { tenantId } : {};
      const response = await apiAuthenticated.get(ATENDENTE_API_URL, { params });
      return response.data || []; // Ensure it always returns an array
    } catch (error) {
      // Handle error, e.g., log it or rethrow a more specific error
      throw error; // Re-throw the error so the component can handle it
    }
  },

  getAtendenteById: async (id) => {
    const response = await apiAuthenticated.get(`${ATENDENTE_API_URL}/${id}`);
    return response.data;
  },

  createAtendente: async (atendenteData) => {
    const response = await apiAuthenticated.post(ATENDENTE_API_URL, atendenteData);
    return response.data;
  },

  updateAtendente: async (id, atendenteData) => {
    const response = await apiAuthenticated.put(`${ATENDENTE_API_URL}/${id}`, atendenteData);
    return response.data;
  },

  deleteAtendente: async (id) => {
    const response = await apiAuthenticated.delete(`${ATENDENTE_API_URL}/${id}`);
    return response.data;
  },

  getAtendentePremiacoes: async (id) => {
    const response = await apiAuthenticated.get(`${ATENDENTE_API_URL}/${id}/premiacoes`);
    return response.data;
  },

  getAtendentePerformance: async (id) => {
    const response = await apiAuthenticated.get(`${ATENDENTE_API_URL}/${id}/performance`);
    return response.data;
  },

  awardBonus: async (id, awardData) => {
    const response = await apiAuthenticated.post(`${ATENDENTE_API_URL}/${id}/premiacoes`, awardData);
    return response.data;
  },
};

export default atendenteService;
