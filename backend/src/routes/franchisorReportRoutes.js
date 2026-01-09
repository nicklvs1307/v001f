const express = require("express");
const router = express.Router();
const franchisorReportController = require("../controllers/franchisorReportController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Proteger todas as rotas com autenticação e verificação de papel
router.use(protect, authorize(['Franqueador']));

// Rota para gerar o relatório consolidado
router.get("/consolidated", franchisorReportController.generateConsolidatedReport);

module.exports = router;
