import apiAuthenticated from './apiAuthenticated';

const getClientDashboardData = async () => {
    try {
        const response = await apiAuthenticated.get('/clients/dashboard');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const getAllClients = async (page, rowsPerPage, orderBy, order, filterText) => {
    try {
        const response = await apiAuthenticated.get('/clients', {
            params: {
                page: page + 1, // A API geralmente espera páginas baseadas em 1
                limit: rowsPerPage,
                orderBy,
                order,
                filter: filterText,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const createClient = async (clientData) => {
    try {
        const response = await apiAuthenticated.post('/clients', clientData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const updateClient = async (id, clientData) => {
    try {
        const response = await apiAuthenticated.put(`/clients/${id}`, clientData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const deleteClient = async (id) => {
    try {
        const response = await apiAuthenticated.delete(`/clients/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const getBirthdayClients = async () => {
    try {
        const response = await apiAuthenticated.get('/clients/birthdays');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const registerClient = async (registrationData) => {
    try {
        const response = await apiAuthenticated.post('/clients/register', registrationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const sendMessage = async (clientId, message) => {
    try {
        const response = await apiAuthenticated.post(`/clients/${clientId}/send-message`, { message });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const clientService = {
    getClientDashboardData,
    getAllClients,
    createClient,
    updateClient,
    deleteClient,
    getBirthdayClients,
    registerClient, // Exportar a nova função
    sendMessage,
};

export default clientService;
