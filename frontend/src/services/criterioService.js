import apiAuthenticated from './apiAuthenticated';

const CRITERIO_API_URL = '/criterios';

const criterioService = {
  getAllCriterios: async () => {
    try {
      const response = await apiAuthenticated.get(CRITERIO_API_URL);
      return response.data || []; // Ensure it always returns an array
    } catch (error) {
      // Handle error, e.g., log it or rethrow a more specific error
      console.error('Error fetching criterios:', error);
      throw error; // Re-throw the error so the component can handle it
    }
  },

  getCriterioById: async (id) => {
    const response = await apiAuthenticated.get(`${CRITERIO_API_URL}/${id}`);
    return response.data;
  },

  createCriterio: async (criterioData) => {
    const response = await apiAuthenticated.post(CRITERIO_API_URL, criterioData);
    return response.data;
  },

  updateCriterio: async (id, criterioData) => {
    const response = await apiAuthenticated.put(`${CRITERIO_API_URL}/${id}`, criterioData);
    return response.data;
  },

  deleteCriterio: async (id) => {
    const response = await apiAuthenticated.delete(`${CRITERIO_API_URL}/${id}`);
    return response.data;
  },
};

export default criterioService;
