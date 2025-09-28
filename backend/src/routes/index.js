const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");

const tenantRoutes = require("./tenantRoutes");
const userRoutes = require("./userRoutes");
const roleRoutes = require("./roleRoutes");
const surveyRoutes = require("./surveyRoutes");
const publicSurveyRoutes = require("./publicSurveyRoutes");
const resultRoutes = require("./resultRoutes");
const configRoutes = require("./configRoutes");
const criterioRoutes = require("./criterioRoutes");
const atendenteRoutes = require("./atendenteRoutes");
const recompensaRoutes = require("./recompensaRoutes");
const cupomRoutes = require("./cupomRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const clientRoutes = require("./clientRoutes"); // Importar clientRoutes
const surveyTemplateRoutes = require('./surveyTemplateRoutes');
const gmbAuthRoutes = require('./gmbAuthRoutes');
const gmbConfigRoutes = require('./gmbConfigRoutes');
const gmbReviewRoutes = require('./gmbReviewRoutes');
const roletaPremioRoutes = require('./roletaPremioRoutes');
const campanhaRoutes = require('./campanhaRoutes');
const atendenteMetaRoutes = require('./atendenteMetaRoutes');
const whatsappConfigRoutes = require('./whatsappConfigRoutes');
const whatsappTemplateRoutes = require('./whatsappTemplateRoutes'); // Rota para templates
const roletaRoutes = require('./roletaRoutes');
const whatsappWebhookRoutes = require('./whatsappWebhookRoutes');
const roletaAdminRoutes = require('./roletaAdminRoutes');

module.exports = (router) => {
  // Rota para Health Check do Docker
  router.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  router.use('/auth', authRoutes);
  router.use('/users', userRoutes);
  router.use('/tenants', tenantRoutes);
  router.use('/roles', roleRoutes);
  router.use('/surveys', surveyRoutes);
  router.use('/public', publicSurveyRoutes);
  router.use('/results', resultRoutes);
  router.use('/config', configRoutes);
  router.use('/criterios', criterioRoutes);
  router.use('/atendentes', atendenteRoutes);
  router.use('/recompensas', recompensaRoutes);
  router.use('/cupons', cupomRoutes);
  router.use('/clients', clientRoutes); // Importar clientRoutes
  router.use('/atendenteMetas', atendenteMetaRoutes);
  router.use('/dashboard', dashboardRoutes);
  router.use('/whatsapp-config', whatsappConfigRoutes);
  router.use('/whatsapp-templates', whatsappTemplateRoutes); // Rota para templates
  router.use('/whatsapp-webhook', whatsappWebhookRoutes);
  router.use('/roleta', roletaRoutes);
  router.use('/survey-templates', surveyTemplateRoutes);
  router.use('/gmb-auth', gmbAuthRoutes);
  router.use('/gmb-config', gmbConfigRoutes);
  router.use('/gmb-review', gmbReviewRoutes);
  router.use('/roleta-premios', roletaPremioRoutes);
  router.use('/campanhas', campanhaRoutes);
  router.use('/roletas', roletaAdminRoutes);
};
