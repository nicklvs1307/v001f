import axios from 'axios';

// Axios instance para endpoints públicos (sem token de autenticação)
const publicApi = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || ''}/api/public`,
  timeout: 15000, // Timeout de 15 segundos
});

// Outra instância sem /public para endpoints abertos fora do escopo /public (ex: cadastro)
const unauthenticatedApi = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || ''}/api`,
  timeout: 15000,
});

const getPublicSurveyById = async (id, signal) => {
    try {
        const response = await publicApi.get(`/surveys/${id}`, { signal });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getPublicAtendentes = async (tenantId, signal) => {
    try {
        const response = await publicApi.get(`/tenants/${tenantId}/atendentes`, { signal });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getPublicTenantById = async (tenantId, signal) => {
    try {
        const response = await publicApi.get(`/tenants/${tenantId}`, { signal });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const submitSurveyResponses = async (surveyId, responses, atendenteId = null, signal) => {
    try {
        const submissionData = {
            respostas: responses,
            atendenteId: atendenteId,
        };
        const response = await publicApi.post(`/surveys/${surveyId}/responses`, submissionData, { signal });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const submitSurveyWithClient = async (data, signal) => {
    try {
        const response = await publicApi.post('/surveys/submit-with-client', data, { signal });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const registerPublicClient = async (registrationData, signal) => {
    try {
        const response = await unauthenticatedApi.post('/clients/register', registrationData, { signal });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const publicSurveyService = {
    getPublicSurveyById,
    getPublicAtendentes,
    getPublicTenantById,
    submitSurveyResponses,
    submitSurveyWithClient,
    registerPublicClient,
};

export default publicSurveyService;
