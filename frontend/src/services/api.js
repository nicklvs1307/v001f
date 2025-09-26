import axios from 'axios';

// Cria a instância base do Axios.
// Esta instância não deve ter interceptors de autenticação.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',

});

export default api;