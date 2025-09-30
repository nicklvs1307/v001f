const express = require('express');
const router = express.Router();
const { check } = require("express-validator");
const whatsappConfigController = require('../controllers/whatsappConfigController');
console.log('[DEBUG] Imported whatsappConfigController in routes:', whatsappConfigController);
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validationMiddleware");

// --- Rotas para o Tenant Admin gerenciar sua própria instância ---

// Busca a configuração atual da instância (nome e status)
router.get(
  '/instance',
  protect,
  authorize(['Admin']),
  whatsappConfigController.getInstanceConfig
);

router.get(
  '/instance/connection-info',
  protect,
  authorize(['Admin']),
  whatsappConfigController.getConnectionInfo
);

// Inicia a conexão e obtém o QR code
router.post(
  '/instance/connect',
  protect,
  authorize(['Admin']),
  whatsappConfigController.connectInstance
);

// Obtém o QR code para conectar (usado para polling)
router.get(
  '/instance/qr',
  protect,
  authorize(['Admin']),
  whatsappConfigController.getQrCode
);

// Desconecta a instância (logout)
router.delete(
  '/instance/logout',
  protect,
  authorize(['Admin']),
  whatsappConfigController.logoutInstance
);

// Deleta a instância permanentemente
router.delete(
  '/instance',
  protect,
  authorize(['Admin']),
  whatsappConfigController.deleteInstance
);


// --- Rotas para o Super Admin configurar os tenants ---

// Obtém a configuração de um tenant específico
router.get(
  '/:tenantId',
  protect,
  authorize(['Super Admin']),
  [ check("tenantId", "ID do tenant inválido").isUUID() ],
  validate,
  whatsappConfigController.getTenantConfig
);

// Salva ou atualiza a configuração de um tenant
router.post(
  '/:tenantId',
  protect,
  authorize(['Super Admin']),
  [
    check("tenantId", "ID do tenant inválido").isUUID(),
    check("url", "URL da Evolution API é obrigatória").not().isEmpty().isURL(),
    check("apiKey", "API Key da Evolution API é obrigatória").not().isEmpty(),
  ],
  validate,
  whatsappConfigController.saveTenantConfig
);

module.exports = router;
