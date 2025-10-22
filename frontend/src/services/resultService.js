import apiAuthenticated from './apiAuthenticated';

const getSurveyResults = async (surveyId) => {
    try {
        const response = await apiAuthenticated.get(`/surveys/${surveyId}/results`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const getMainDashboard = async ({ tenantId, startDate, endDate }) => {
    try {
        const response = await apiAuthenticated.get(`/dashboard/main`, { 
            params: { tenantId, startDate, endDate } 
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const getWordCloudData = async (tenantId) => {
    try {
        const response = await apiAuthenticated.get(`/results/word-cloud`, {
            params: { tenantId }
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const resultService = {
    getSurveyResults,
    getMainDashboard,
    getWordCloudData,
};

export default resultService;
