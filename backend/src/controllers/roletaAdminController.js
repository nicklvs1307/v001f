'use strict';
const asyncHandler = require('express-async-handler');
const roletaRepository = require('../repositories/roletaRepository');
const ApiError = require('../errors/ApiError');

exports.createRoleta = asyncHandler(async (req, res) => {
  const { nome, descricao, active } = req.body;
  const tenantId = req.user.tenantId;

  if (!nome) {
    throw new ApiError(400, 'Nome da roleta é obrigatório.');
  }

  const roleta = await roletaRepository.createRoleta({ tenantId, nome, descricao, active });
  res.status(201).json(roleta);
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
  const { nome, descricao, active } = req.body;

  const updatedRows = await roletaRepository.updateRoleta(id, tenantId, { nome, descricao, active });

  if (updatedRows === 0) {
    throw new ApiError(404, 'Roleta não encontrada para atualização.');
  }
  res.status(200).json({ message: 'Roleta atualizada com sucesso.' });
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
