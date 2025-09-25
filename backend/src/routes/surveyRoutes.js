const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const surveyController = require("../controllers/surveyController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

// Middleware de validação para perguntas
const surveyQuestionsValidation = [
  check("questions").optional().isArray().withMessage("Perguntas devem ser um array."),
  check("questions.*.id").optional().isUUID().withMessage("ID da pergunta inválido."),
  check("questions.*.text", "Texto da pergunta é obrigatório e deve ser uma string.").isString().notEmpty(),
  check("questions.*.type", "Tipo da pergunta é obrigatório e deve ser válido.").isIn([
    'rating_1_5', 'rating_0_10', 'free_text', 'multiple_choice', 'checkbox'
  ]),
  check("questions.*.options").optional().isArray().withMessage("Opções da pergunta devem ser um array."),
  check("questions.*.criterioId").optional().isUUID().withMessage("ID do critério inválido."),
];

// Todas as rotas abaixo são protegidas e requerem autenticação.
router.use(protect);

// Novas rotas para estatísticas e lista de pesquisas
router.get("/stats", authorize("surveys:read"), surveyController.getSurveyStats);
router.get("/list", authorize("surveys:read"), surveyController.getSurveysList);

router.get("/qrcode", authorize("surveys:read"), surveyController.generateSurveyQrCode);

router.post(
  "/",
  authorize("surveys:create"),
  [
    check("title", "Título da pesquisa é obrigatório e deve ter no mínimo 3 caracteres").isLength({ min: 3 }).not().isEmpty(),
    check("description", "Descrição deve ser uma string").optional().isString(),
    check("dueDate", "Data de vencimento inválida").optional().isISO8601().toDate(),
    check("status", "Status inválido").optional().isIn(['active', 'inactive', 'draft', 'pending']),
    check("isOpen", "O campo 'isOpen' deve ser um booleano").optional().isBoolean(),
    check("askForAttendant", "O campo 'askForAttendant' deve ser um booleano").optional().isBoolean(),
    ...surveyQuestionsValidation, // Reutiliza a validação de perguntas
  ],
  validate,
  surveyController.createSurvey
);

// Rotas para obter, atualizar e deletar uma pesquisa específica
router
  .route("/:id")
  .get(authorize("surveys:read"), surveyController.getSurveyById)
  .put(
    authorize("surveys:update"),
    [
      check("title", "Título da pesquisa deve ter no mínimo 3 caracteres").optional().isLength({ min: 3 }),
      check("description", "Descrição deve ser uma string").optional().isString(),
      check("dueDate", "Data de vencimento inválida").optional().isISO8601().toDate(),
      check("status", "Status inválido").optional().isIn(['active', 'inactive', 'draft', 'pending']),
      check("isOpen", "O campo 'isOpen' deve ser um booleano").optional().isBoolean(),
      check("askForAttendant", "O campo 'askForAttendant' deve ser um booleano").optional().isBoolean(),
      ...surveyQuestionsValidation, // Reutiliza a validação de perguntas
    ],
    validate,
    surveyController.updateSurvey
  )
  .delete(authorize("surveys:delete"), surveyController.deleteSurvey);

router.get("/:id/results", authorize("surveys:read"), surveyController.getSurveyResults);

module.exports = router;
