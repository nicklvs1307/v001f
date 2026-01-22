import apiAuthenticated from '../apiAuthenticated';

const planService = {
    getAllPlans: () => apiAuthenticated.get('/superadmin/plans'),
    createPlan: (data) => apiAuthenticated.post('/superadmin/plans', data),
    updatePlan: (id, data) => apiAuthenticated.put(`/superadmin/plans/${id}`, data),
    deletePlan: (id) => apiAuthenticated.delete(`/superadmin/plans/${id}`),
};

export default planService;
