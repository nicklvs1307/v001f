import { api } from './api';

const publicRoletaService = {
  getRoletaConfig: (pesquisaId, clientId) => api.get(`/roleta/config/${pesquisaId}/${clientId}`),
  spinRoleta: (pesquisaId, clientId) => api.post(`/roleta/spin/${pesquisaId}/${clientId}`),
  sendPrizeMessage: (cupomId) => api.post('/roleta/send-prize-message', { cupomId }),
};

export default publicRoletaService;