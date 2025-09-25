import axios from 'axios';

// Axios instance para endpoints públicos (sem token de autenticação)
const publicApi = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL || '/api'}/public`,
});

const getPublicSurveyById = async (id) => {
    try {
        const response = await publicApi.get(`/surveys/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const getPublicAtendentes = async (tenantId) => {
    try {
        const response = await publicApi.get(`/tenants/${tenantId}/atendentes`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const getPublicTenantById = async (tenantId) => {
    try {
        const response = await publicApi.get(`/tenants/${tenantId}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const submitSurveyResponses = async (surveyId, responses, atendenteId = null) => {
    try {
        const submissionData = {
            respostas: responses,
            atendenteId: atendenteId,
        };
        const response = await publicApi.post(`/surveys/${surveyId}/responses`, submissionData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const submitSurveyWithClient = async (data) => {
    try {
        const response = await publicApi.post('/surveys/submit-with-client', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const publicSurveyService = {
    getPublicSurveyById,
    getPublicAtendentes,
    getPublicTenantById,
    submitSurveyResponses,
    submitSurveyWithClient,
};

export default publicSurveyService;
