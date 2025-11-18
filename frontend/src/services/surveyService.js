import apiAuthenticated from './apiAuthenticated';

/**
 * Serviço para lidar com operações relacionadas a pesquisas (surveys).
 */


/**
 * Obtém uma pesquisa pelo ID.
 * @param {string} id - O ID da pesquisa.
 * @returns {Promise<object>} Os dados da pesquisa.
 * @throws {object} O objeto de erro da resposta da API.
 */
const getSurveyById = async (id) => {
    try {
        const response = await apiAuthenticated.get(`/surveys/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Cria uma nova pesquisa.
 * @param {object} surveyData - Os dados da pesquisa a serem criados.
 * @returns {Promise<object>} A pesquisa criada.
 * @throws {object} O objeto de erro da resposta da API.
 */
const createSurvey = async (surveyData) => {
    try {
        const response = await apiAuthenticated.post('/surveys', surveyData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Atualiza uma pesquisa existente.
 * @param {string} id - O ID da pesquisa a ser atualizada.
 * @param {object} surveyData - Os dados da pesquisa a serem atualizados.
 * @returns {Promise<object>} A pesquisa atualizada.
 * @throws {object} O objeto de erro da resposta da API.
 */
const updateSurvey = async (id, surveyData) => {
    try {
        const response = await apiAuthenticated.put(`/surveys/${id}`, surveyData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Deleta uma pesquisa.
 * @param {string} id - O ID da pesquisa a ser deletada.
 * @returns {Promise<object>} Os dados da resposta da deleção.
 * @throws {object} O objeto de erro da resposta da API.
 */
const deleteSurvey = async (id) => {
    try {
        const response = await apiAuthenticated.delete(`/surveys/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Gera um QR Code para uma URL pública de pesquisa.
 * @param {string} publicUrl - A URL pública da pesquisa.
 * @returns {Promise<object>} Os dados do QR Code gerado.
 * @throws {object} O objeto de erro da resposta da API.
 */
const generateQrCode = async (publicUrl) => {
    try {
        const response = await apiAuthenticated.get('/surveys/qrcode', { params: { url: publicUrl } });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtém estatísticas de pesquisas.
 * @returns {Promise<object>} As estatísticas das pesquisas.
 * @throws {object} O objeto de erro da resposta da API.
 */
const getSurveyStats = async () => {
    try {
        const response = await apiAuthenticated.get('/surveys/stats');
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtém uma lista de pesquisas.
 * @returns {Promise<Array>} Uma lista de pesquisas, ou um array vazio se não houver dados.
 * @throws {object} O objeto de erro da resposta da API.
 */
const getSurveysList = async (status = 'all') => {
    try {
        const response = await apiAuthenticated.get('/surveys/list', {
            params: { status }
        });
        return response.data || []; // Garante que sempre retorne um array
    } catch (error) {
        throw error;
    }
};

const getSurveyResults = async (surveyId) => {
    try {
        const response = await apiAuthenticated.get(`/surveys/${surveyId}/results`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const surveyService = {

    getSurveyById,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    generateQrCode,
    getSurveyStats, // Exportar nova função
    getSurveysList, // Exportar nova função
    getSurveyResults,
};

export default surveyService;