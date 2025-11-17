const express = require("express");
const router = express.Router();
const { check, param } = require("express-validator");
const publicSurveyController = require("../controllers/publicSurveyController");
const validate = require("../middlewares/validationMiddleware");

// Rota pública para obter detalhes de uma pesquisa
router.get(
  "/surveys/:id",
  [param("id", "ID da pesquisa inválido").isUUID().not().isEmpty()],
  validate,
  publicSurveyController.getPublicSurveyById,
);

// Rota pública para obter atendentes de um tenant
router.get(
  "/tenants/:tenantId/atendentes",
  [param("tenantId", "ID do tenant inválido").isUUID().not().isEmpty()],
  validate,
  publicSurveyController.getPublicAtendentesByTenant,
);

// Rota pública para obter detalhes de um tenant
router.get(
  "/tenants/:id",
  [param("id", "ID do tenant inválido").isUUID().not().isEmpty()],
  validate,
  publicSurveyController.getPublicTenantById,
);

// Rota pública para submeter respostas de uma pesquisa
router.post(
  "/surveys/:id/responses",
  [
    param("id", "ID da pesquisa inválido").isUUID().not().isEmpty(),
    check("clientId", "ID do cliente inválido").optional().isUUID(),
    check("respostas", "Respostas são obrigatórias e devem ser um array")
      .isArray()
      .not()
      .isEmpty(),
    check("respostas.*.perguntaId", "ID da pergunta inválido")
      .isUUID()
      .not()
      .isEmpty(),
    check("respostas.*.valor").optional(),
    check("respostas.*.criterioId", "ID do critério inválido")
      .optional()
      .isUUID(),
    // Validação customizada para o atendenteId
    check("atendenteId").custom(async (value, { req }) => {
      const surveyId = req.params.id;
      const { Pesquisa } = require("../../models");
      const survey = await Pesquisa.findByPk(surveyId, {
        attributes: ["askForAttendant"],
      });

      if (survey && survey.askForAttendant) {
        if (!value) {
          return Promise.reject("O nome do atendente é obrigatório.");
        }
        // Valida se o valor é um UUID
        const isUUID =
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
            value,
          );
        if (!isUUID) {
          return Promise.reject("ID do atendente inválido.");
        }
      }
      return true;
    }),
  ],
  validate,
  publicSurveyController.submitSurveyResponses,
);

// Rota para submeter pesquisa + cliente identificado por telefone
router.post(
  "/surveys/submit-with-client",
  publicSurveyController.submitSurveyWithClient,
);

module.exports = router;
