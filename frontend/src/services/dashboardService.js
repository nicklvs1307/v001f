import apiAuthenticated from './apiAuthenticated';

const dashboardService = {
    getMainDashboard: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/main', { params });
        return response.data;
    },
};

export default dashboardService;
