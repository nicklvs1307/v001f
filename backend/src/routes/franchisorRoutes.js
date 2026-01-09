const express = require("express");
const router = express.Router();
const franchisorController = require("../controllers/franchisorController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

// Proteger todas as rotas de franqueador com autenticação e verificação de papel
router.use(authMiddleware, checkRole(['Franqueador']));

// Rota para o dashboard do franqueador
router.get("/dashboard", franchisorController.getDashboard);

// Rota para listar os franqueados de uma franqueadora
router.get("/franchisees", franchisorController.getFranchisees);

// Outras rotas futuras para o franqueador (ex: gerenciar franqueados) podem ser adicionadas aqui

module.exports = router;
