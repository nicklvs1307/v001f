const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const resultController = require("../controllers/resultController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

// Todas as rotas abaixo são protegidas e requerem autenticação.
router.use(protect);

// Rota para obter resultados agregados de uma pesquisa
router
  .route("/surveys/:id/results")
  .get(
    [
      check("id", "ID da pesquisa inválido").isUUID().not().isEmpty(),
    ],
    validate,
    authorize("results:read"),
    resultController.getSurveyResults
  );

module.exports = router;
