import apiAuthenticated from './apiAuthenticated';

const dashboardService = {
    getSummary: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/summary', { params });
        return response.data;
    },

    getResponseChart: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/response-chart', { params });
        return response.data;
    },
    
    getCriteriaScores: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/nps-criteria', { params });
        return response.data;
    },

    getFeedbacks: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/recent-feedbacks', { params });
        return response.data;
    },

    getNpsTrend: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/nps-trend', { params });
        return response.data;
    },

    getConversionChart: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/conversion-chart', { params });
        return response.data;
    },

    getSurveysRespondedChart: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/surveys-responded-chart', { params });
        return response.data;
    },

    getMainDashboard: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/main', { params });
        return response.data;
    },

    getDailyReport: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/daily-report', { params });
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

    getAttendantsPerformance: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/attendants-performance', { params });
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

    getAllFeedbacks: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/all-feedbacks', { params });
        return response.data;
    },

    getWeeklyReport: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/weekly-report', { params });
        return response.data;
    },

    getMonthlyReport: async (params) => {
        const response = await apiAuthenticated.get('/dashboard/monthly-report', { params });
        return response.data;
    },
};

export default dashboardService;
