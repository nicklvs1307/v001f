import apiAuthenticated from './apiAuthenticated';

const whatsappTemplateService = {
  get: (type) => {
    return apiAuthenticated.get(`/whatsapp-templates?type=${type}`);
  },

  upsert: (templateData) => {
    return apiAuthenticated.post('/whatsapp-templates', templateData);
  },
};

export default whatsappTemplateService;
