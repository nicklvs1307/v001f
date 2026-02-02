import apiAuthenticated from './apiAuthenticated';

const getAllCupons = async (filters = {}) => {
    try {
        const response = await apiAuthenticated.get('/cupons', { params: filters });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getCuponsSummary = async (tenantId = null) => {
    try {
        const response = await apiAuthenticated.get('/cupons/summary', { params: { tenantId } });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const validateCupom = async (codigo) => {
    try {
        const response = await apiAuthenticated.post('/cupons/validate', { codigo });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getCupomByCodigo = async (codigo) => {
    try {
        const response = await apiAuthenticated.get(`/cupons/codigo/${codigo}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getCupomById = async (id) => {
    try {
        const response = await apiAuthenticated.get(`/cupons/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const generateCupom = async (cupomData) => {
    try {
        const response = await apiAuthenticated.post('/cupons/generate', cupomData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const deleteCupom = async (id) => {
    try {
        const response = await apiAuthenticated.delete(`/cupons/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const cancelCupom = async (id, reason) => {
    try {
        const response = await apiAuthenticated.post(`/cupons/${id}/cancel`, { reason });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const cupomService = {
    getAllCupons,
    getCuponsSummary,
    validateCupom,
    getCupomByCodigo,
    getCupomById,
    generateCupom,
    deleteCupom,
    cancelCupom
};

export default cupomService;