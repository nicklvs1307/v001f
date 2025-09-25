import api from './api';
import apiAuthenticated from './apiAuthenticated';

const login = async (credentials) => {
    try {
        const { email, password } = credentials;
        // Login não precisa de token, usa a instância base
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const verifyToken = async () => {
    try {
        // verify-token precisa do token, usa a instância autenticada
        const response = await apiAuthenticated.post('/auth/verify-token');
        return response.data;
    } catch (error) {
        throw error;
    }
};

const authService = {
    login,
    verifyToken,
};

export default authService;
