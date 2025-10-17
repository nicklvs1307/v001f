import apiAuthenticated from './apiAuthenticated';

const CUPOM_API_URL = '/cupons';

const cupomService = {
  generateCupom: async (cupomData) => {
    const response = await apiAuthenticated.post(`${CUPOM_API_URL}/generate`, cupomData);
    return response.data;
  },

  getAllCupons: async () => {
    const response = await apiAuthenticated.get(CUPOM_API_URL);
    return response.data;
  },

  getCupomById: async (id) => {
    const response = await apiAuthenticated.get(`${CUPOM_API_URL}/${id}`);
    return response.data;
  },

  validateCupom: async (codigo) => {
    const response = await apiAuthenticated.post(`${CUPOM_API_URL}/validate`, { codigo });
    return response.data;
  },

  getCuponsSummary: async () => {
    const response = await apiAuthenticated.get(`${CUPOM_API_URL}/summary`);
    return response.data;
  },

  getCupomByCodigo: async (codigo) => {
    const response = await apiAuthenticated.get(`${CUPOM_API_URL}/codigo/${codigo}`);
    return response.data;
  },

  deleteCupom: async (id) => {
    const response = await apiAuthenticated.delete(`${CUPOM_API_URL}/${id}`);
    return response.data;
  },
};

export default cupomService;
