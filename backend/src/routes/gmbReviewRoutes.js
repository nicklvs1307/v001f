const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const gmbReviewController = require("../controllers/gmbReviewController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

// Todas as rotas de avaliações GMB exigem autenticação
router.use(protect);

// Rotas para Avaliações GMB
router.get(
  "/",
  authorize(["Admin", "Super Admin"]),
  gmbReviewController.getAllReviews,
);
router.put(
  "/:id/reply",
  [
    check("id", "ID da avaliação inválido").isUUID().not().isEmpty(),
    check("replyContent", "Conteúdo da resposta é obrigatório").not().isEmpty(),
  ],
  validate,
  authorize(["Admin", "Super Admin"]),
  gmbReviewController.replyToReview,
);
router.post(
  "/sync",
  validate, // Adicionar validate mesmo que não haja parâmetros de corpo explícitos, para consistência
  authorize(["Admin", "Super Admin"]),
  gmbReviewController.syncReviews,
);

module.exports = router;
