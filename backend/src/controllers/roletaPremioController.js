'use strict';
const asyncHandler = require('express-async-handler');
const roletaPremioRepository = require('../repositories/roletaPremioRepository');
const ApiError = require('../errors/ApiError');

// @desc    Criar um novo prêmio para a roleta
// @route   POST /api/roleta-premios
// @access  Private (Admin)
exports.createPremio = asyncHandler(async (req, res) => {
  const { roletaId, nome, descricao, probabilidade, recompensaId } = req.body;
  const tenantId = req.user.tenantId;

  if (!roletaId || !nome || !probabilidade || !recompensaId) {
    throw new ApiError(400, 'ID da roleta, nome, probabilidade e ID da recompensa são obrigatórios.');
  }

  const premio = await roletaPremioRepository.createPremio({ tenantId, roletaId, nome, descricao, probabilidade, recompensaId });
  res.status(201).json(premio);
});

// @desc    Listar todos os prêmios da roleta do tenant
// @route   GET /api/roleta-premios
// @access  Private (Admin)
exports.getAllPremios = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  const { roletaId } = req.query;
  const premios = await roletaPremioRepository.findAll({ tenantId, roletaId });
  res.status(200).json({ premios });
});

// @desc    Obter um prêmio da roleta por ID
// @route   GET /api/roleta-premios/:id
// @access  Private (Admin)
exports.getPremioById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;
  const premio = await roletaPremioRepository.findById(id, tenantId);

  if (!premio) {
    throw new ApiError(404, 'Prêmio da roleta não encontrado.');
  }
  res.status(200).json(premio);
});

// @desc    Atualizar um prêmio da roleta
// @route   PUT /api/roleta-premios/:id
// @access  Private (Admin)
exports.updatePremio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;
  const { roletaId, nome, descricao, probabilidade, recompensaId } = req.body;

  const updatedRows = await roletaPremioRepository.updatePremio(id, tenantId, { roletaId, nome, descricao, probabilidade, recompensaId });

  if (updatedRows === 0) {
    throw new ApiError(404, 'Prêmio da roleta não encontrado para atualização.');
  }
  res.status(200).json({ message: 'Prêmio atualizado com sucesso.' });
});

// @desc    Deletar um prêmio da roleta
// @route   DELETE /api/roleta-premios/:id
// @access  Private (Admin)
exports.deletePremio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;

  const deletedRows = await roletaPremioRepository.deletePremio(id, tenantId);

  if (deletedRows === 0) {
    throw new ApiError(404, 'Prêmio da roleta não encontrado para deleção.');
  }
  res.status(204).send();
});
