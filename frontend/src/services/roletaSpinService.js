
import apiAuthenticated from "./apiAuthenticated";

const API_URL = "/roleta-spins";

const roletaSpinService = {
  validateToken: (token) => apiAuthenticated.get(`${API_URL}/validate/${token}`),
  spinRoleta: (token) => apiAuthenticated.post(`${API_URL}/spin/${token}`),
};

export default roletaSpinService;
