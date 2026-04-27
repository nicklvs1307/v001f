import axios from 'axios';

const createApiInstance = (baseURL, timeout = 30000) => {
  const api = axios.create({
    baseURL,
    timeout,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  api.interceptors.response.use(
    response => response,
    async (error) => {
      const originalRequest = error.config;

      if (!originalRequest) {
        return Promise.reject(error);
      }

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
        return api(originalRequest);
      }

      console.error('[API Error]', error.message, error.response?.status);
      return Promise.reject(error);
    }
  );

  return api;
};

const api = createApiInstance(`${process.env.REACT_APP_API_URL || ''}/api`);
const publicApi = createApiInstance(`${process.env.REACT_APP_API_URL || ''}/api/public`);
const unauthenticatedApi = createApiInstance(`${process.env.REACT_APP_API_URL || ''}/api`);

export { api, publicApi, unauthenticatedApi };
export default api;