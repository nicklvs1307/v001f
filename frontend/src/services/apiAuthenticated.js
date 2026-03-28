import axios from 'axios';

let logoutObserver = null;

export const setupAuthObserver = (logoutHandler) => {
  logoutObserver = logoutHandler;
};

// Crie uma nova instância do Axios para requisições autenticadas
const apiAuthenticated = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || ''}/api`,
  timeout: 15000,
});

// Adicionar um interceptor de requisição para incluir o token JWT
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
  (error) => {
    return Promise.reject(error);
  }
);

// Adicionar um interceptor de resposta para tratar erros de autenticação
apiAuthenticated.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (logoutObserver) {
        logoutObserver();
      }
    }
    return Promise.reject(error);
  }
);

export default apiAuthenticated;