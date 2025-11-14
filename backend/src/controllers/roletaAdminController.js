'use strict';
const asyncHandler = require('express-async-handler');
const roletaRepository = require('../repositories/roletaRepository');
const ApiError = require('../errors/ApiError');
const { sequelize } = require('../../models');

exports.createRoleta = asyncHandler(async (req, res) => {
  const { nome, descricao, active, premios } = req.body;
  const tenantId = req.user.tenantId;

  if (!nome) {
    throw new ApiError(400, 'Nome da roleta é obrigatório.');
  }
  if (!premios || !Array.isArray(premios) || premios.length === 0) {
    throw new ApiError(400, 'A roleta deve ter pelo menos um prêmio.');
  }

  const totalPercentage = premios.reduce((sum, premio) => sum + premio.porcentagem, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) { // Tolerância para ponto flutuante
    throw new ApiError(400, 'A soma das porcentagens dos prêmios deve ser 100%.');
  }

  const result = await sequelize.transaction(async (t) => {
    const roleta = await roletaRepository.createRoleta({ tenantId, nome, descricao, active }, t);

    const premiosData = premios.map(p => ({
      ...p,
      roletaId: roleta.id,
      tenantId: tenantId,
    }));

    await roletaRepository.bulkCreatePremios(premiosData, t);

    return roleta;
  });

  res.status(201).json(result);
});

exports.getAllRoletas = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  const roletas = await roletaRepository.findAllByTenant(tenantId);
  res.status(200).json(roletas);
});

exports.getRoletaById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;
  const roleta = await roletaRepository.findById(id, tenantId);

  if (!roleta) {
    throw new ApiError(404, 'Roleta não encontrada.');
  }
  res.status(200).json(roleta);
});

exports.updateRoleta = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;
  const { nome, descricao, active, premios } = req.body;

  if (!premios || !Array.isArray(premios) || premios.length === 0) {
    throw new ApiError(400, 'A roleta deve ter pelo menos um prêmio.');
  }

  const totalPercentage = premios.reduce((sum, premio) => sum + premio.porcentagem, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new ApiError(400, 'A soma das porcentagens dos prêmios deve ser 100%.');
  }

  const result = await sequelize.transaction(async (t) => {
    const updatedRows = await roletaRepository.updateRoleta(id, tenantId, { nome, descricao, active }, t);

    if (updatedRows === 0) {
      throw new ApiError(404, 'Roleta não encontrada para atualização.');
    }

    await roletaRepository.deletePremiosByRoletaId(id, t);

    const premiosData = premios.map(p => ({
      ...p,
      roletaId: id,
      tenantId: tenantId,
    }));

    await roletaRepository.bulkCreatePremios(premiosData, t);

    return { message: 'Roleta atualizada com sucesso.' };
  });

  res.status(200).json(result);
});

exports.deleteRoleta = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;

  const deletedRows = await roletaRepository.deleteRoleta(id, tenantId);

  if (deletedRows === 0) {
    throw new ApiError(404, 'Roleta não encontrada para deleção.');
  }
  res.status(204).send();
});
