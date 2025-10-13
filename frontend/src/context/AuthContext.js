import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiAuthenticated, { setupAuthObserver } from '../services/apiAuthenticated'; // Para configurar o observer
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
  refreshUser: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const logout = useCallback(() => {
        localStorage.removeItem('userToken');
        delete apiAuthenticated.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/login');
    }, [navigate]);

    useEffect(() => {
        // Configura o observador de logout assim que o componente monta
        setupAuthObserver(logout);

        const checkUser = async () => {
            const token = localStorage.getItem('userToken');
            if (token) {
                try {
                    const userData = await authService.verifyToken(); // authService usará a instância autenticada
                    setUser(userData);
                } catch (error) {
                    console.error("Falha na verificação do token", error);
                    logout();
                }
            }
            setLoading(false);
        };
        checkUser();
    }, [logout]);

    const login = async (credentials) => {
    try {
        const { token } = await authService.login(credentials);
        const decodedUser = jwtDecode(token);
        localStorage.setItem('userToken', token);
        // Adiciona o token aos headers da instância autenticada para futuras requisições
        apiAuthenticated.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(decodedUser);
        navigate('/'); // Redireciona para a página principal após o login
    } catch (error) {
        // O erro da chamada da API será propagado para quem chamou (LoginPage)
        throw error;
    }
};

    const refreshUser = useCallback(async () => {
        try {
            const userData = await authService.verifyToken();
            setUser(userData);
        } catch (error) {
            console.error("Falha ao atualizar os dados do usuário", error);
            logout(); // Desloga se a atualização falhar
        }
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
