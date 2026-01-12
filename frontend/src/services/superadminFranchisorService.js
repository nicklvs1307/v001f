import apiAuthenticated from './apiAuthenticated';

const superadminFranchisorService = {
  getFranchisors: () => {
    return apiAuthenticated.get('/superadmin/franchisors');
  },
  getFranchisorById: (id) => {
    return apiAuthenticated.get(`/superadmin/franchisors/${id}`);
  },
  createFranchisor: (data) => {
    return apiAuthenticated.post('/superadmin/franchisors', data);
  },
  updateFranchisor: (id, data) => {
    return apiAuthenticated.put(`/superadmin/franchisors/${id}`, data);
  },
  deleteFranchisor: (id) => {
    return apiAuthenticated.delete(`/superadmin/franchisors/${id}`);
  },
};

export default superadminFranchisorService;
