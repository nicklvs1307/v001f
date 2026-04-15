import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiAuthenticated, { setupAuthObserver } from '../services/apiAuthenticated';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import superadminService from '../services/superadminService';
import { ROLES } from '../constants/roles';

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  loginAsTenant: () => {},
  loading: true,
  refreshUser: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loginAsTenant = useCallback(async (tenantId) => {
        try {
            const response = await superadminService.loginAsTenant(tenantId);
            const { token, user: tenantUser } = response.data;
            
            localStorage.setItem('superadmin_token', localStorage.getItem('userToken'));
            localStorage.setItem('userToken', token);
            apiAuthenticated.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(tenantUser);
            navigate('/dashboard');
            return tenantUser;
        } catch (error) {
            console.error('Error logging in as tenant:', error);
            throw error;
        }
    }, [navigate]);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem('userToken');
        } catch (e) {
            console.warn("localStorage block on logout", e);
        }
        delete apiAuthenticated.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/login');
    }, [navigate]);

    useEffect(() => {
        // Configura o observador de logout assim que o componente monta
        setupAuthObserver(logout);

        const checkUser = async () => {
            let token = null;
            try {
                token = localStorage.getItem('userToken');
            } catch (e) {
                console.warn("localStorage block on init", e);
            }
            if (token) {
                try {
                    const userData = await authService.verifyToken();
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to verify token:", error);
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
            try {
                localStorage.setItem('userToken', token);
            } catch (e) {
                console.error("Failed to save token to localStorage (probably private mode)", e);
            }
            const userData = await authService.verifyToken();
            setUser(userData);

            const userRole = typeof userData?.role === 'string' ? userData.role : userData?.role?.name;

            // Redirecionamento baseado no papel (Role)
            if (userRole === ROLES.SUPER_ADMIN) {
                navigate('/superadmin');
            } else if (userRole === ROLES.FRANQUEADOR) {
                navigate('/franchisor');
            } else {
                navigate('/dashboard');
            }
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
        <AuthContext.Provider value={{ user, login, logout, loginAsTenant, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

export const useAuth = () => {
  return useContext(AuthContext);
};
