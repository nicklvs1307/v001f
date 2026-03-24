import api from './api';

const franchisorService = {
  getDashboard: async (params) => {
    const response = await api.get('/franchisor/dashboard', { params });
    return response.data;
  },
  getFranchisees: async () => {
    const response = await api.get('/franchisor/franchisees');
    return response.data;
  }
};

export default franchisorService;
