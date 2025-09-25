import apiAuthenticated from './apiAuthenticated';

const dashboardService = {
    getDashboardSummary: async () => {
        const response = await apiAuthenticated.get('/dashboard/summary');
        return response.data;
    },

    getResponseChartData: async () => {
        const response = await apiAuthenticated.get('/dashboard/response-chart');
        return response.data;
    },

    getRankingAttendants: async () => {
        const response = await apiAuthenticated.get('/dashboard/ranking-attendants');
        return response.data;
    },

    getNPSCritera: async () => {
        const response = await apiAuthenticated.get('/dashboard/nps-criteria');
        return response.data;
    },

    getRecentFeedbacks: async () => {
        const response = await apiAuthenticated.get('/dashboard/recent-feedbacks');
        return response.data;
    },

    getConversionChartData: async () => {
        const response = await apiAuthenticated.get('/dashboard/conversion-chart');
        return response.data;
    },
    getOverallDashboardResults: async () => {
        const response = await apiAuthenticated.get('/dashboard/overall-results');
        return response.data;
    },
    getAttendantsPerformance: async () => {
        const response = await apiAuthenticated.get('/dashboard/attendants-performance');
        return response.data;
    },
};

export default dashboardService;
