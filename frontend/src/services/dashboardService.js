import apiAuthenticated from './apiAuthenticated';

const dashboardService = {
    getMainDashboard: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/main', { params });
        return response.data;
    },

    getDetails: async (category, params) => {
        const response = await apiAuthenticated.get(`/dashboard/details/${category}`, { params });
        return response.data;
    },

    getAttendantDetails: async (attendantId, params) => {
        const response = await apiAuthenticated.get(`/dashboard/attendant/${attendantId}`, { params });
        return response.data;
    },

    getResponseDetails: async (sessionId) => {
        const response = await apiAuthenticated.get(`/dashboard/response/${sessionId}`);
        return response.data;
    },

    getAttendantsPerformance: async () => {
        const response = await apiAuthenticated.get('/dashboard/attendants-performance');
        return response.data;
    },

    getMonthSummary: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/month-summary', { params });
        return response.data;
    },

    getWordCloudData: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/wordcloud', { params });
        return response.data;
    },

    getEvolutionDashboard: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/evolution', { params });
        return response.data;
    },
};

export default dashboardService;
