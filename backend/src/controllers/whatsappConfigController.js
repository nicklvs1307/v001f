const asyncHandler = require('express-async-handler');
const whatsappConfigRepository = require('../repositories/whatsappConfigRepository');
const whatsappService = require('../services/whatsappService');
const ApiError = require('../errors/ApiError');
const whatsappWebhookRepository = require('../repositories/whatsappWebhookRepository');
const { Tenant, WhatsappConfig } = require('../../models');

const whatsappConfigController = {
  // --- Rotas para o Tenant Admin ---

  // GET /api/whatsapp/instance -> Busca a configuração da instância do tenant logado
  getInstanceConfig: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const config = await whatsappConfigRepository.findByTenant(tenantId);
    
    if (!config) {
      // Se não há configuração, retorna um status que o frontend possa interpretar
      return res.json({
        instanceName: null,
        status: 'unconfigured',
      });
    }

    // Adiciona o status atual da conexão à resposta
    const statusData = await whatsappService.getInstanceStatus(tenantId);
    res.json({
      instanceName: config.instanceName,
      status: statusData.status,
    });
  }),

  // GET /api/whatsapp/instance/connection-info -> Busca detalhes da conexão
  getConnectionInfo: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const info = await whatsappService.getConnectionInfo(tenantId);
    res.json(info);
  }),

  // POST /api/whatsapp/instance -> Cria uma nova instância
  createInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const { url, apiKey } = req.body;

    if (!url || url.trim() === '') {
      throw new ApiError(400, "A URL da API do WhatsApp é obrigatória.");
    }
    if (!apiKey || apiKey.trim() === '') {
      throw new ApiError(400, "A chave da API do WhatsApp é obrigatória.");
    }

    // Passo 1: Cria ou atualiza a configuração do WhatsApp
    await whatsappConfigRepository.upsert({ tenantId, url, apiKey });

    // Passo 2: Tenta criar a instância na API do WhatsApp
    const result = await whatsappService.createInstance(tenantId);

    // Passo 3: Retorna o resultado ou o erro estruturado
    if (result && result.status === 'error') {
      const statusCode = result.code && (result.code.startsWith('HTTP_4') || result.code === 'not_found') ? 400 : 500;
      return res.status(statusCode).json(result);
    }

    res.status(201).json(result);
  }),

  // GET /api/whatsapp/instance/qr -> Obtém o QR code
  getInstanceQrCode: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const qrCodeData = await whatsappService.getInstanceQrCode(tenantId);
    res.json(qrCodeData);
  }),

  // DELETE /api/whatsapp/instance/logout -> Desconecta (logout)
  logoutInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const result = await whatsappService.logoutInstance(tenantId);
    res.json(result);
  }),

  // DELETE /api/whatsapp/instance -> Deleta a instância permanentemente
  deleteInstance: asyncHandler(async (req, res) => {
    const { tenantId } = req.user;
    const result = await whatsappService.deleteInstance(tenantId);
    res.json(result);
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

module.exports = whatsappConfigController;
