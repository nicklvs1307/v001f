import apiAuthenticated from './apiAuthenticated';

const getSurveyResults = async (surveyId) => {
    try {
        const response = await apiAuthenticated.get(`/surveys/${surveyId}/results`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const getLegacyOverallResults = async (tenantId) => {
    try {
        const response = await apiAuthenticated.get(`/dashboard/overall-results`, { params: { tenantId } });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const getMainDashboard = async (tenantId) => {
    try {
        const response = await apiAuthenticated.get(`/dashboard/main`, { params: { tenantId } });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const resultService = {
    getSurveyResults,
    getLegacyOverallResults,
    getMainDashboard,
    getNpsTrend: async (tenantId, period = 'day') => {
        try {
            const response = await apiAuthenticated.get('/dashboard/nps-trend', { params: { tenantId, period } });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getWordCloudData: async (tenantId) => {
        try {
            const response = await apiAuthenticated.get('/dashboard/wordcloud', { params: { tenantId } });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
};

export default resultService;
