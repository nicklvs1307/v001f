const express = require('express');
const router = express.Router();
const { check } = require("express-validator");
const configController = require('../controllers/configController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validationMiddleware");

// Todas as rotas de configuração exigem autenticação
router.use(authMiddleware.protect); // Corrigido para usar a função protect

router.get('/tenant', authMiddleware.authorize(['Admin', 'Super Admin']), configController.getTenantConfig);
router.put(
  '/tenant',
  [
    check("primaryColor", "Cor primária deve ser uma string").optional().isString(),
    check("secondaryColor", "Cor secundária deve ser uma string").optional().isString(),
    check("restaurantName", "Nome do restaurante deve ser uma string não vazia").optional().not().isEmpty(),
    check("restaurantAddress", "Endereço do restaurante deve ser uma string não vazia").optional().not().isEmpty(),
    check("restaurantPhone", "Telefone do restaurante deve ser uma string não vazia").optional().not().isEmpty(),
    check("restaurantEmail", "Email do restaurante inválido").optional().isEmail(),
    check("restaurantWebsite", "Website do restaurante inválido").optional().isURL(),
  ],
  validate,
  authMiddleware.authorize(['Admin', 'Super Admin']),
  configController.updateTenantConfig
);

module.exports = router;