import apiAuthenticated from './apiAuthenticated';

const GMB_CONFIG_API_URL = '/gmb-config';

const gmbConfigService = {
  getConfig: async () => {
    const response = await apiAuthenticated.get(GMB_CONFIG_API_URL);
    return response.data;
  },

  createOrUpdateConfig: async (configData) => {
    const response = await apiAuthenticated.post(GMB_CONFIG_API_URL, configData);
    return response.data;
  },
};

export default gmbConfigService;
