const express = require("express");
const router = express.Router();
const franchisorReportController = require("../controllers/franchisorReportController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

// Proteger todas as rotas com autenticação e verificação de papel
router.use(authMiddleware, checkRole(['Franqueador']));

// Rota para gerar o relatório consolidado
router.get("/consolidated", franchisorReportController.generateConsolidatedReport);

module.exports = router;
