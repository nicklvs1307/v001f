import api from './api';

const whatsappTemplateService = {
  get: (type) => {
    return api.get(`/whatsapp-templates?type=${type}`);
  },

  upsert: (templateData) => {
    return api.post('/whatsapp-templates', templateData);
  },
};

export default whatsappTemplateService;
