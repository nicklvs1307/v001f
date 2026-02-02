import apiAuthenticated from './apiAuthenticated';

const CUPOM_API_URL = '/cupons';

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
