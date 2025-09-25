'use strict';
const express = require('express');
const router = express.Router();
const { check } = require("express-validator");
const roletaController = require('../controllers/roletaController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validationMiddleware");

// Rota para girar a roleta
// @route   POST /api/roleta/spin
// @access  Public (TODO: ALERTA DE SEGURANÇA - Esta rota é pública e permite que qualquer pessoa com um ID de cliente tente girar a roleta.
// É crucial implementar a lógica de controle no `roletaController.spinRoleta` para garantir que um cliente 
// possa girar a roleta apenas uma vez, por exemplo, verificando um campo 'hasSpunRoleta' na tabela de clientes.)
router.post(
  '/spin',
  [
    check("clientId", "ID do cliente é obrigatório").isUUID().not().isEmpty(),
  ],
  validate,
  roletaController.spinRoleta
);

router.get('/config/:clientId', roletaController.getRoletaConfig);

module.exports = router;
