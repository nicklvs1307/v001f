const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const gmbConfigController = require("../controllers/gmbConfigController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

// Todas as rotas de configuração GMB exigem autenticação
router.use(protect);

// Rotas para Configuração GMB
router.post(
  "/",
  [
    check("accessToken", "Access Token é obrigatório").not().isEmpty(),
    check("refreshToken", "Refresh Token é obrigatório").not().isEmpty(),
    check("locationId", "Location ID é obrigatório").not().isEmpty(),
    check("tenantId", "Tenant ID inválido").optional().isUUID(),
  ],
  validate,
  authorize(['Admin', 'Super Admin']),
  gmbConfigController.createOrUpdateConfig
);
router.get(
  "/",
  authorize(['Admin', 'Super Admin']),
  gmbConfigController.getConfig
);
router.delete(
  "/",
  authorize(['Admin', 'Super Admin']),
  gmbConfigController.deleteConfig
);

module.exports = router;
