const asyncHandler = require('express-async-handler');
const whatsappConfigRepository = require('../repositories/whatsappConfigRepository');
const tenantRepository = require('../repositories/tenantRepository'); // Importar tenantRepository
const whatsappService = require('../services/whatsappService');
const ApiError = require('../errors/ApiError');
const whatsappWebhookRepository = require('../repositories/whatsappWebhookRepository');

const whatsappConfigController = {
  // --- Rotas para o Tenant Admin ---

  getInstanceConfig: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const config = await whatsappConfigRepository.findByTenant(tenantId);

    if (!config) {
      return res.json({ status: 'unconfigured' });
    }

    const currentStatus = await whatsappService.getInstanceStatus(tenantId);
    
    // Retorna o objeto de configuração completo do banco de dados, com o status atualizado
    const response = {
      ...config.get({ plain: true }),
      status: currentStatus,
    };

    res.json(response);
  }),

  getConnectionInfo: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const info = await whatsappService.getConnectionInfo(tenantId);
    res.json(info);
  }),

  createInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const result = await whatsappService.createRemoteInstance(tenantId);
    res.json(result);
  }),

  getQrCode: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const qrCodeData = await whatsappService.getQrCodeForConnect(tenantId);
    console.log('[DEBUG] QR Code Response from Service:', qrCodeData);
    res.json(qrCodeData);
  }),

  logoutInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const result = await whatsappService.logoutInstance(tenantId);
    res.json(result);
  }),

  restartInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const result = await whatsappService.restartInstance(tenantId);
    res.json(result);
  }),

  deleteInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const result = await whatsappService.deleteInstance(tenantId);
    res.json(result);
  }),

  updateAutomationsConfig: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const { reportPhoneNumbers, ...configData } = req.body;

    // 1. Atualiza a tabela whatsapp_configs
    await whatsappConfigRepository.update(tenantId, configData);

    // 2. Atualiza a tabela tenants
    if (reportPhoneNumbers !== undefined) {
      await tenantRepository.update(tenantId, { reportPhoneNumber: reportPhoneNumbers });
    }

    res.status(200).json({ message: 'Automações atualizadas com sucesso.' });
  }),

  // --- Rotas para o Super Admin ---
  
  getTenantConfig: asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const config = await whatsappConfigRepository.findByTenant(tenantId);
    if (!config) {
      throw new ApiError(404, "Configuração do WhatsApp não encontrada.");
    }
    res.json(config);
  }),

  saveTenantConfig: asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const { url, apiKey } = req.body;

    if (!url || url.trim() === '') {
      throw new ApiError(400, "A URL da API do WhatsApp é obrigatória.");
    }
    if (!apiKey || apiKey.trim() === '') {
      throw new ApiError(400, "A chave da API do WhatsApp é obrigatória.");
    }

    const data = { ...req.body, tenantId };
    const config = await whatsappConfigRepository.upsert(data);
    res.json(config);
  }),

  // --- Webhook ---
  handleWebhook: asyncHandler(async (req, res) => {
    const { event, instance, data } = req.body;
    console.log('Webhook recebido:', req.body);

    if (event === 'connection.update') {
      const { state } = data;
      const newStatus = state === 'CONNECTED' ? 'connected' : 'disconnected';
      await whatsappWebhookRepository.updateStatusByInstanceName(instance, newStatus);
    }

    res.sendStatus(200);
  }),
};

module.exports = {
  ...whatsappConfigController,
  updateAutomationsConfig: whatsappConfigController.updateAutomationsConfig
};