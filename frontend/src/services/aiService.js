import apiAuthenticated from './apiAuthenticated';

const AI_API_BASE_URL = '/ai'; // Matches the backend route

const aiService = {
  generateMessageVariations: async (baseMessage, numVariations) => {
    try {
      const response = await apiAuthenticated.post(`${AI_API_BASE_URL}/generate-variations`, {
        baseMessage,
        numVariations,
      });
      return response.data.spintax;
    } catch (error) {
      console.error('Error generating AI variations:', error);
      throw error;
    }
  },

  getChatCompletion: async (messages) => {
    try {
      const response = await apiAuthenticated.post(`${AI_API_BASE_URL}/chat`, {
        messages,
      });
      return response.data.response;
    } catch (error) {
      console.error('Error getting AI chat completion:', error);
      throw error;
    }
  },
};

export default aiService;
