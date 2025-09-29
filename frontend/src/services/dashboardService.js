import apiAuthenticated from './apiAuthenticated';

const dashboardService = {
    getMainDashboard: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/main', { params });
        return response.data;
    },

    getAttendantsPerformance: async () => {
        const response = await apiAuthenticated.get('/dashboard/attendants-performance');
        return response.data;
    },
};

export default dashboardService;
