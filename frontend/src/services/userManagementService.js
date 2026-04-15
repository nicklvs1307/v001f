import apiAuthenticated from './apiAuthenticated';

const userManagementService = {
  getSuperAdminUsers: () => apiAuthenticated.get('/superadmin/users'),
  
  createSuperAdminUser: (data) => apiAuthenticated.post('/superadmin/users', data),
  
  updateSuperAdminUser: (id, data) => apiAuthenticated.put(`/superadmin/users/${id}`, data),
  
  deleteSuperAdminUser: (id) => apiAuthenticated.delete(`/superadmin/users/${id}`),
  
  changePassword: (data) => apiAuthenticated.post('/superadmin/change-password', data),
};

export default userManagementService;
