import apiAuthenticated from './apiAuthenticated';

const GMB_REVIEW_API_URL = '/gmb-review';

const gmbReviewService = {
  getReviews: async (filters) => {
    const response = await apiAuthenticated.get(GMB_REVIEW_API_URL, { params: filters });
    return response.data;
  },

  getReviewSummary: async () => {
    const response = await apiAuthenticated.get(`${GMB_REVIEW_API_URL}/summary`);
    return response.data;
  },
};

export default gmbReviewService;
