import axios from 'axios';

let logoutObserver = null;

export const setupAuthObserver = (logoutHandler) => {
  logoutObserver = logoutHandler;
};

// Criar instância axios com timeout maior e retry
const createAuthenticatedApi = () => {
  const apiAuthenticated = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL || ''}/api`,
    timeout: 30000,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  // Interceptor de request para adicionar token
  apiAuthenticated.interceptors.request.use(
    (config) => {
      let token = null;
      try {
        token = localStorage.getItem('userToken');
      } catch (e) {}

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de response com retry automático
  apiAuthenticated.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Tratar erro de autenticação
      if (error.response?.status === 401) {
        if (logoutObserver) {
          logoutObserver();
        }
        return Promise.reject(error);
      }

      // Retry para erros de rede e 5xx
      if (originalRequest) {
        if (!originalRequest._retryCount) {
          originalRequest._retryCount = 0;
        }

        const isNetworkError = !error.response;
        const isTimeout = error.code === 'ECONNABORTED';
        const is5xx = error.response?.status >= 500 && error.response?.status < 600;

        if ((isNetworkError || isTimeout || is5xx) && originalRequest._retryCount < 3) {
          originalRequest._retryCount += 1;
          
          const delay = originalRequest._retryCount * 1000;
          console.log(`[API Retry] Tentativa ${originalRequest._retryCount}/3 após ${delay}ms: ${originalRequest.url}`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return apiAuthenticated(originalRequest);
        }
      }

      console.error('[API Error]', error.message, error.response?.status);
      return Promise.reject(error);
    }
  );

  return apiAuthenticated;
};

const apiAuthenticated = createAuthenticatedApi();

export default apiAuthenticated;