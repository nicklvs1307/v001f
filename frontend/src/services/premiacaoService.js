import api from './api';

const premiacaoService = {
  getAllPremiacoes: async () => {
    try {
      const response = await api.get('/premiacoes');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
};

export default premiacaoService;
