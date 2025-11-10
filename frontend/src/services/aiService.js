import axios from 'axios';

const AI_API_BASE_URL = '/api/ai'; // Matches the backend route

const aiService = {
  generateMessageVariations: async (baseMessage, numVariations) => {
    try {
      const response = await axios.post(`${AI_API_BASE_URL}/generate-variations`, {
        baseMessage,
        numVariations,
      });
      return response.data.spintax;
    } catch (error) {
      console.error('Error generating AI variations:', error);
      throw error;
    }
  },
};

export default aiService;
