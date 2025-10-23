
import apiAuthenticated from "./apiAuthenticated";

const API_URL = "/roleta";

const roletaSpinService = {
  validateToken: (token) => apiAuthenticated.get(`${API_URL}/spins/validate/${token}`),
  spinRoleta: (token) => apiAuthenticated.post(`${API_URL}/spins/spin/${token}`),
};

export default roletaSpinService;
