const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const surveyTemplateController = require("../controllers/surveyTemplateController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

// Todas as rotas de templates de pesquisa exigem autenticação
router.use(protect);

// Rota para criar um novo template
router.post(
  "/",
  [
    check("name", "Nome do template é obrigatório").not().isEmpty(),
    check("description", "Descrição deve ser uma string").optional().isString(),
    check("questions", "Perguntas são obrigatórias e devem ser um array")
      .isArray()
      .not()
      .isEmpty(),
  ],
  validate,
  authorize(["Admin", "Super Admin"]),
  surveyTemplateController.createTemplate,
);

// Rotas para Templates de Pesquisa
router.get(
  "/",
  authorize(["Admin", "Super Admin", "Survey Creator"]),
  surveyTemplateController.getAllTemplates,
);
router
  .route("/:id")
  .get(
    [check("id", "ID do template inválido").isUUID().not().isEmpty()],
    validate,
    authorize(["Admin", "Super Admin", "Survey Creator"]),
    surveyTemplateController.getTemplateById,
  )
  .put(
    [
      check("id", "ID do template inválido").isUUID().not().isEmpty(),
      check("name", "Nome do template é obrigatório")
        .optional()
        .not()
        .isEmpty(),
      check("description", "Descrição deve ser uma string")
        .optional()
        .isString(),
      check("questions", "Perguntas devem ser um array").optional().isArray(),
    ],
    validate,
    authorize(["Admin", "Super Admin"]),
    surveyTemplateController.updateTemplate,
  )
  .delete(
    [check("id", "ID do template inválido").isUUID().not().isEmpty()],
    validate,
    authorize(["Admin", "Super Admin"]),
    surveyTemplateController.deleteTemplate,
  );

// Rota para criar uma nova pesquisa a partir de um template
router.post(
  "/:id/create-survey",
  [
    check("id", "ID do template inválido").isUUID().not().isEmpty(),
    check(
      "title",
      "Título da pesquisa é obrigatório e deve ter no mínimo 3 caracteres",
    )
      .isLength({ min: 3 })
      .not()
      .isEmpty(),
    check("description", "Descrição deve ser uma string").optional().isString(),
    check("dueDate", "Data de vencimento inválida")
      .optional()
      .isISO8601()
      .toDate(),
    check("status", "Status inválido").optional().isIn(["active", "inactive"]),
  ],
  validate,
  authorize(["Admin", "Super Admin", "Survey Creator"]),
  surveyTemplateController.createSurveyFromTemplate,
);

// Rota para sobrescrever uma pesquisa existente com um template
router.put(
  "/:templateId/overwrite-survey/:surveyId",
  [
    check("templateId", "ID do template inválido").isUUID().not().isEmpty(),
    check("surveyId", "ID da pesquisa inválido").isUUID().not().isEmpty(),
  ],
  validate,
  authorize(["Admin", "Super Admin", "Survey Creator"]),
  surveyTemplateController.overwriteSurveyWithTemplate,
);

module.exports = router;
