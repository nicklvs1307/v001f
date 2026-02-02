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
const surveyTemplateRoutes = require("./surveyTemplateRoutes");
const gmbAuthRoutes = require("./gmbAuthRoutes");
const gmbConfigRoutes = require("./gmbConfigRoutes");
const gmbReviewRoutes = require("./gmbReviewRoutes");
const roletaPremioRoutes = require("./roletaPremioRoutes");
const campanhaRoutes = require("./campanhaRoutes");
const atendenteMetaRoutes = require("./atendenteMetaRoutes");
const whatsappConfigRoutes = require("./whatsappConfigRoutes");
const whatsappTemplateRoutes = require("./whatsappTemplateRoutes"); // Rota para templates
const roletaRoutes = require("./roletaRoutes");
const whatsappWebhookRoutes = require("./whatsappWebhookRoutes");
const deliveryWebhookRoutes = require("./deliveryWebhookRoutes"); // Importar as novas rotas de webhook de delivery
const ifoodRoutes = require("./ifoodRoutes"); // Importar as rotas do iFood
const roletaAdminRoutes = require("./roletaAdminRoutes");
const automationRoutes = require("./automationRoutes");
const tratativaRoutes = require("./tratativaRoutes");
const aiRoutes = require("./aiRoutes"); // Import the new AI routes
const replicaRoutes = require("./replicaRoutes");
const auditRoutes = require("./auditRoutes");
const premiacaoController = require("../controllers/premiacaoController"); // Importar o novo controller

// Super Admin Routes
const superadminRoutes = require("./superadminRoutes");
const senderRoutes = require("./superadmin/senderRoutes");
const reportRoutes = require("./superadmin/reportRoutes");
const franchisorAdminRoutes = require("./superadmin/franchisorAdminRoutes"); // Rota para Super Admin gerenciar franqueadoras
const planRoutes = require("./superadmin/planRoutes"); // Importar rotas de planos
const permissionRoutes = require("./superadmin/permissionRoutes"); // Importar rotas de permissões
const franchisorRoutes = require("./franchisorRoutes"); // Importar rotas do franqueador
const franchisorReportRoutes = require("./franchisorReportRoutes");

module.exports = (router) => {
  // Rota para Health Check do Docker
  router.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  // Super Admin Routes
  router.use("/superadmin", superadminRoutes);
  router.use("/superadmin/senders", senderRoutes);
  router.use("/superadmin/reports", reportRoutes);
  router.use("/superadmin/franchisors", franchisorAdminRoutes);
  router.use("/superadmin/plans", planRoutes);
  router.use("/superadmin", permissionRoutes); // Montar rotas de permissões

  // Franchisor Routes
  router.use("/franchisor", franchisorRoutes);
  router.use("/franchisor/reports", franchisorReportRoutes);

  router.use("/auth", authRoutes);
  router.use("/users", userRoutes);
  router.use("/tenants", tenantRoutes);
  router.use("/roles", roleRoutes);
  router.use("/surveys", surveyRoutes);
  router.use("/public", publicSurveyRoutes);
  router.use("/results", resultRoutes);
  router.use("/config", configRoutes);
  router.use("/criterios", criterioRoutes);
  router.use("/atendentes", atendenteRoutes);
  router.use("/recompensas", recompensaRoutes);
  router.use("/cupons", cupomRoutes);
  router.use("/clients", clientRoutes); // Importar clientRoutes
  router.use("/atendenteMetas", atendenteMetaRoutes);
  router.use("/dashboard", dashboardRoutes);
  router.use("/whatsapp-config", whatsappConfigRoutes);
  router.use("/whatsapp-templates", whatsappTemplateRoutes); // Rota para templates
  router.use("/whatsapp-webhook", whatsappWebhookRoutes);
  router.use("/delivery-webhooks", deliveryWebhookRoutes); // Registrar as novas rotas de webhook de delivery
  router.use("/ifood", ifoodRoutes); // Registrar as rotas do iFood
  router.use("/roleta", roletaRoutes);
  router.use("/survey-templates", surveyTemplateRoutes);
  router.use("/gmb-auth", gmbAuthRoutes);
  router.use("/gmb-config", gmbConfigRoutes);
  router.use("/gmb-review", gmbReviewRoutes);
  router.use("/roleta-premios", roletaPremioRoutes);
  router.use("/campanhas", campanhaRoutes);
  router.use("/roletas", roletaAdminRoutes);
  router.use("/automations", automationRoutes);
  router.use("/tratativas", tratativaRoutes);
  router.use("/replicas", replicaRoutes);
  router.use("/audit", auditRoutes);
  router.use("/ai", aiRoutes); // Register AI routes
  router.get("/premiacoes", premiacaoController.getAllPremiacoes); // Adicionar rota para premiações
};
