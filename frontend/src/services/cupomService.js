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

  // Não há update/delete direto de cupons, apenas validação e expiração automática
};

export default cupomService;
