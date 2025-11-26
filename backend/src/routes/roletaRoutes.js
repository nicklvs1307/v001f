"use strict";
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const roletaController = require("../controllers/roletaController");
const roletaSpinController = require("../controllers/roletaSpinController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

// Rota para girar a roleta
// @route   POST /api/roleta/spin
// @access  Public (TODO: ALERTA DE SEGURANÇA - Esta rota é pública e permite que qualquer pessoa com um ID de cliente tente girar a roleta.
// É crucial implementar a lógica de controle no `roletaController.spinRoleta` para garantir que um cliente
// possa girar a roleta apenas uma vez, por exemplo, verificando um campo 'hasSpunRoleta' na tabela de clientes.)
router.post(
  "/spin/:pesquisaId/:clientId",
  [
    check("pesquisaId", "ID da pesquisa é obrigatório")
      .isUUID()
      .not()
      .isEmpty(),
    check("clientId", "ID do cliente é obrigatório").isUUID().not().isEmpty(),
  ],
  validate,
  roletaController.spinRoleta,
);

router.get("/config/:pesquisaId/:clientId", roletaController.getRoletaConfig);

router.get("/spins/validate/:token", roletaSpinController.validateToken);
router.post("/spins/spin/:token", roletaSpinController.spinRoleta);

module.exports = router;
