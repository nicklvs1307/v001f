import api from './api';

const franchisorService = {
  getDashboard: (params) => {
    return api.get('/franchisor/dashboard', { params });
  },
  getFranchisees: () => {
    return api.get('/franchisor/franchisees');
  }
};

export default franchisorService;
