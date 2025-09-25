'use strict';
const express = require('express');
const router = express.Router();
const { check } = require("express-validator");
const roletaPremioController = require('../controllers/roletaPremioController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validationMiddleware");

// Proteger todas as rotas abaixo
router.use(protect);
router.use(authorize(['Admin']));

router.route('/')
  .get(roletaPremioController.getAllPremios)
  .post(
    [
      check("nome", "Nome do prêmio é obrigatório").not().isEmpty(),
      check("descricao", "Descrição do prêmio deve ser uma string").optional().isString(),
      check("probabilidade", "Probabilidade do prêmio é obrigatória e deve ser um número entre 0 e 100").isFloat({ min: 0, max: 100 }).not().isEmpty(),
      check("recompensaId", "ID da recompensa é obrigatório").isUUID().not().isEmpty(),
    ],
    validate,
    roletaPremioController.createPremio
  );

router.route('/:id')
  .get(
    [
      check("id", "ID do prêmio inválido").isUUID().not().isEmpty(),
    ],
    validate,
    roletaPremioController.getPremioById
  )
  .put(
    [
      check("id", "ID do prêmio inválido").isUUID().not().isEmpty(),
      check("name", "Nome do prêmio deve ser uma string não vazia").optional().not().isEmpty(),
      check("description", "Descrição do prêmio deve ser uma string").optional().isString(),
      check("chance", "Chance do prêmio deve ser um número entre 0 e 100").optional().isFloat({ min: 0, max: 100 }),
    ],
    validate,
    roletaPremioController.updatePremio
  )
  .delete(
    [
      check("id", "ID do prêmio inválido").isUUID().not().isEmpty(),
    ],
    validate,
    roletaPremioController.deletePremio
  );

module.exports = router;
