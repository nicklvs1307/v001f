import apiAuthenticated from './apiAuthenticated';

const getParticipations = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await apiAuthenticated.get('/audit/surveys', {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getParticipationDetails = async (sessionId) => {
  try {
    const response = await apiAuthenticated.get(`/audit/surveys/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const cancelParticipation = async (sessionId, reason) => {
  try {
    const response = await apiAuthenticated.post(`/audit/surveys/${sessionId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const auditService = {
  getParticipations,
  getParticipationDetails,
  cancelParticipation
};

export default auditService;
