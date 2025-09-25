const express = require("express");
const router = express.Router();
const { check, param } = require("express-validator");
const publicSurveyController = require("../controllers/publicSurveyController");
const validate = require("../middlewares/validationMiddleware");

// Rota pública para obter detalhes de uma pesquisa
router.get(
  "/surveys/:id",
  [
    param("id", "ID da pesquisa inválido").isUUID().not().isEmpty(),
  ],
  validate,
  publicSurveyController.getPublicSurveyById
);

// Rota pública para obter atendentes de um tenant
router.get(
  "/tenants/:tenantId/atendentes",
  [
    param("tenantId", "ID do tenant inválido").isUUID().not().isEmpty(),
  ],
  validate,
  publicSurveyController.getPublicAtendentesByTenant
);

// Rota pública para obter detalhes de um tenant
router.get(
  "/tenants/:id",
  [
    param("id", "ID do tenant inválido").isUUID().not().isEmpty(),
  ],
  validate,
  publicSurveyController.getPublicTenantById
);

// Rota pública para submeter respostas de uma pesquisa
router.post(
  "/surveys/:id/responses",
  [
    param("id", "ID da pesquisa inválido").isUUID().not().isEmpty(),
    check("clientId", "ID do cliente inválido").optional().isUUID(),
    check("atendenteId", "ID do atendente inválido").optional().isUUID(),
    check("respostas", "Respostas são obrigatórias e devem ser um array").isArray().not().isEmpty(),
    check("respostas.*.perguntaId", "ID da pergunta inválido").isUUID().not().isEmpty(),
    check("respostas.*.valor").optional(),
    check("respostas.*.criterioId", "ID do critério inválido").optional().isUUID(),
  ],
  validate,
  publicSurveyController.submitSurveyResponses,
);

// Rota para submeter pesquisa + cliente identificado por telefone
router.post(
  "/surveys/submit-with-client",
  publicSurveyController.submitSurveyWithClient
);

module.exports = router;
