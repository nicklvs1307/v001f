import axios from 'axios';

let logoutObserver = null;

export const setupAuthObserver = (logoutHandler) => {
  logoutObserver = logoutHandler;
};

// Crie uma nova instância do Axios para requisições autenticadas
const apiAuthenticated = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
});

// Adicionar um interceptor de requisição para incluir o token JWT
apiAuthenticated.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
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
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (logoutObserver) {
        logoutObserver(); // Chama a função de logout registrada
      }
    }
    // Rejeita a promessa para que o erro possa ser tratado no local da chamada
    return Promise.reject(error);
  }
);

export default apiAuthenticated;
