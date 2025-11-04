import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
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
                apiAuthenticated.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const userData = await authService.verifyToken(); // authService usará a instância autenticada
                    setUser(userData);
                } catch (error) {
                    logout();
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (credentials) => {
        try {
            const { token } = await authService.login(credentials);
            localStorage.setItem('userToken', token);
            apiAuthenticated.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const userData = await authService.verifyToken();
            setUser(userData);
            navigate('/dashboard');
        } catch (error) {
            throw error;
        }
    };

    const refreshUser = useCallback(async () => {
        try {
            const userData = await authService.verifyToken();
            setUser(userData);
        } catch (error) {
            console.error("Falha ao atualizar os dados do usuário", error);
            logout();
        }
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

export const useAuth = () => {
  return useContext(AuthContext);
};
