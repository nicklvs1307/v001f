import apiAuthenticated from './apiAuthenticated';

const SURVEY_TEMPLATE_API_URL = '/survey-templates';

const surveyTemplateService = {
  // Busca todos os templates (geralmente para um tenant específico ou templates do sistema)
  getAllTemplates: async (tenantId = null) => {
    try {
      const response = await apiAuthenticated.get(SURVEY_TEMPLATE_API_URL, { 
        params: { tenantId } 
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Busca um template específico pelo ID
  getTemplateById: async (id) => {
    try {
      const response = await apiAuthenticated.get(`${SURVEY_TEMPLATE_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Cria um novo template
  createTemplate: async (templateData) => {
    try {
      const response = await apiAuthenticated.post(SURVEY_TEMPLATE_API_URL, templateData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Atualiza um template existente
  updateTemplate: async (id, templateData) => {
    try {
      const response = await apiAuthenticated.put(`${SURVEY_TEMPLATE_API_URL}/${id}`, templateData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Deleta um template
  deleteTemplate: async (id) => {
    try {
      const response = await apiAuthenticated.delete(`${SURVEY_TEMPLATE_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};

export default surveyTemplateService;