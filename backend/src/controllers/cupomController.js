const asyncHandler = require('express-async-handler');
const cupomRepository = require('../repositories/cupomRepository');
const recompensaRepository = require('../repositories/recompensaRepository');
const ApiError = require('../errors/ApiError');
const { v4: uuidv4 } = require('uuid');
const { CampanhaLog } = require('../../models');

const cupomController = {
  generateCupom: asyncHandler(async (req, res) => {
    const { recompensaId, clienteId, dataValidade } = req.body;
    const requestingUser = req.user;

    const recompensa = await recompensaRepository.findById(recompensaId);
    if (!recompensa) {
      throw new ApiError(404, 'Recompensa não encontrada.');
    }

    const targetTenantId =
      requestingUser.role === 'Super Admin' && req.body.tenantId
        ? req.body.tenantId
        : requestingUser.tenantId;

    if (!targetTenantId) {
      throw new ApiError(400, 'Tenant ID é obrigatório para gerar um cupom.');
    }

    const codigo = uuidv4(); // Gerar um código único para o cupom

    const cupom = await cupomRepository.createCupom({
      tenantId: targetTenantId,
      recompensaId,
      codigo,
      clienteId,
      dataValidade,
    });

    res.status(201).json({ message: 'Cupom gerado com sucesso!', cupom });
  }),

  getAllCupons: asyncHandler(async (req, res) => {
    const requestingUser = req.user;
    const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;
    const filters = req.query;
    const cupons = await cupomRepository.getAllCupons(tenantId, filters);
    res.status(200).json(cupons);
  }),

  getCupomById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

    const cupom = await cupomRepository.getCupomById(id, tenantId);

    if (!cupom) {
      throw new ApiError(404, 'Cupom não encontrado.');
    }

    if (
      requestingUser.role !== 'Super Admin' &&
      cupom.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(403, 'Você não tem permissão para ver este cupom.');
    }

    res.status(200).json(cupom);
  }),

  validateCupom: asyncHandler(async (req, res) => {
    const { codigo } = req.body;
    const requestingUser = req.user;
    const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

    const cupom = await cupomRepository.getCupomByCodigo(codigo, tenantId);

    if (!cupom) {
      throw new ApiError(404, 'Cupom não encontrado.');
    }

    if (
      requestingUser.role !== 'Super Admin' &&
      cupom.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(403, 'Você não tem permissão para validar este cupom.');
    }

    if (cupom.status === 'used') {
      throw new ApiError(400, 'Cupom já utilizado.');
    }

    if (new Date(cupom.dataValidade) < new Date()) {
      throw new ApiError(400, 'Cupom expirado.');
    }

    // Atualizar status do cupom para 'used' e registrar data de utilização
    const updatedCupom = await cupomRepository.updateCupom(cupom.id, cupom.tenantId, {
      status: 'used',
      dataUtilizacao: new Date(),
    });

    if (!updatedCupom) {
      throw new ApiError(500, 'Falha ao atualizar status do cupom.');
    }

    // Track conversion for A/B testing
    if (updatedCupom.campanhaId && updatedCupom.clienteId) {
      try {
        const logEntry = await CampanhaLog.findOne({
          where: {
            campanhaId: updatedCupom.campanhaId,
            clienteId: updatedCupom.clienteId,
          },
        });

        if (logEntry && !logEntry.convertedAt) {
          await logEntry.update({ convertedAt: new Date() });
        }
      } catch (error) {
        // Log the error but don't fail the request, as the coupon validation was successful.
        console.error('[Conversion Tracking] Failed to update CampanhaLog:', error);
      }
    }

    // --- NOTIFICATION ---
    // const io = req.app.get('io');
    // const notificationService = require('../services/NotificationService');
    // await notificationService.createNotification(io, {
    //     type: 'COUPON_USED',
    //     message: `Cupom "${cupom.codigo}" utilizado.`,
    //     tenantId: cupom.tenantId,
    //     userId: req.user.id
    // });
    // --- END NOTIFICATION ---

    res.status(200).json({ message: 'Cupom validado com sucesso!', cupom: updatedCupom });
  }),

  getCuponsSummary: asyncHandler(async (req, res) => {
    const requestingUser = req.user;
    const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

    const summary = await cupomRepository.getCuponsSummary(tenantId);
    res.status(200).json(summary);
  }),

  getCupomByCodigo: asyncHandler(async (req, res) => {
    const { codigo } = req.params;
    const requestingUser = req.user;
    const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

    const cupom = await cupomRepository.getCupomByCodigo(codigo, tenantId);

    if (!cupom) {
      throw new ApiError(404, 'Cupom não encontrado.');
    }

    if (
      requestingUser.role !== 'Super Admin' &&
      cupom.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(403, 'Você não tem permissão para ver este cupom.');
    }

    res.status(200).json(cupom);
  }),

  deleteCupom: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

    const cupom = await cupomRepository.getCupomById(id, tenantId);

    if (!cupom) {
      throw new ApiError(404, 'Cupom não encontrado.');
    }

    if (
      requestingUser.role !== 'Super Admin' &&
      cupom.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(403, 'Você não tem permissão para deletar este cupom.');
    }

    await cupomRepository.deleteCupom(id, tenantId);

    res.status(200).json({ message: 'Cupom deletado com sucesso!' });
  }),
};

module.exports = cupomController;
