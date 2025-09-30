const asyncHandler = require('express-async-handler');
const whatsappConfigRepository = require('../repositories/whatsappConfigRepository');
const whatsappService = require('../services/whatsappService');
const ApiError = require('../errors/ApiError');
const whatsappWebhookRepository = require('../repositories/whatsappWebhookRepository');
const { Tenant, WhatsappConfig } = require('../../models');

module.exports = {
  getInstanceConfig,
  getConnectionInfo,
  createInstance,       // <-- Nova
  getQrCode,            // <-- Renomeada e agora a única para obter QR
  logoutInstance,
  deleteInstance,
  getTenantConfig,
  saveTenantConfig,
  handleWebhook,
};
