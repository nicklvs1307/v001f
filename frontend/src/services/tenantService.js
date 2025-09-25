import apiAuthenticated from './apiAuthenticated';

const getAllTenants = async () => {
    try {
        const response = await apiAuthenticated.get('/tenants');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const createTenant = async (tenantData) => {
    try {
        const response = await apiAuthenticated.post('/tenants', tenantData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const updateTenant = async (id, tenantData) => {
    try {
        const response = await apiAuthenticated.put(`/tenants/${id}`, tenantData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const deleteTenant = async (id) => {
    try {
        const response = await apiAuthenticated.delete(`/tenants/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const tenantService = {
    getAllTenants,
    createTenant,
    updateTenant,
    deleteTenant,
};

export default tenantService;
