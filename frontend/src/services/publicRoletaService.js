import api from "./api"; // Assuming 'api' is for public routes

const publicRoletaService = {
  getRoletaConfig: (pesquisaId, clientId) => api.get(`/roleta/config/${pesquisaId}/${clientId}`),
  spinRoleta: (pesquisaId, clientId) => api.post(`/roleta/spin/${pesquisaId}/${clientId}`),
};

export default publicRoletaService;
