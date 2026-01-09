const express = require("express");
const router = express.Router();
const franchisorController = require("../controllers/franchisorController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Proteger todas as rotas de franqueador com autenticação e verificação de papel
router.use(protect, authorize(['Franqueador']));

// Rota para o dashboard do franqueador
router.get("/dashboard", franchisorController.getDashboard);

// Rota para listar os franqueados de uma franqueadora
router.get("/franchisees", franchisorController.getFranchisees);

// Outras rotas futuras para o franqueador (ex: gerenciar franqueados) podem ser adicionadas aqui

module.exports = router;
