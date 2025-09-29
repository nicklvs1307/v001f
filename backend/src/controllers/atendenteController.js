const asyncHandler = require('express-async-handler');
const atendenteRepository = require('../repositories/atendenteRepository');
const ApiError = require('../errors/ApiError');

const atendenteController = {
  createAtendente: asyncHandler(async (req, res) => {
    const { name, status } = req.body;
    const requestingUser = req.user;

    const targetTenantId =
      requestingUser.role === 'Super Admin' && req.body.tenantId
        ? req.body.tenantId
        : requestingUser.tenantId;

    if (!targetTenantId) {
      throw new ApiError(400, 'Tenant ID é obrigatório para criar um atendente.');
    }

    let atendente;
    let retries = 5;
    while (retries > 0) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      try {
        atendente = await atendenteRepository.createAtendente(
          targetTenantId,
          name,
          status,
          code
        );
        break; // Success
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          retries--;
          if (retries === 0) {
            throw new ApiError(500, 'Não foi possível gerar um código único para o atendente.');
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    res.status(201).json({ message: 'Atendente criado com sucesso!', atendente });
  }),

  getAllAtendentes: asyncHandler(async (req, res) => {
    const requestingUser = req.user;
    const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

    const atendentes = await atendenteRepository.getAllAtendentes(tenantId);
    res.status(200).json(atendentes);
  }),

  getAtendenteById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

    const atendente = await atendenteRepository.getAtendenteById(id, tenantId);

    if (!atendente) {
      throw new ApiError(404, 'Atendente não encontrado.');
    }

    if (
      requestingUser.role !== 'Super Admin' &&
      atendente.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(403, 'Você não tem permissão para ver este atendente.');
    }

    res.status(200).json(atendente);
  }),

  updateAtendente: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;
    const requestingUser = req.user;
    const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

    const existingAtendente = await atendenteRepository.getAtendenteById(id, tenantId);
    if (!existingAtendente) {
      throw new ApiError(404, 'Atendente não encontrado.');
    }

    if (
      requestingUser.role !== 'Super Admin' &&
      existingAtendente.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(403, 'Você não tem permissão para atualizar este atendente.');
    }

    const updatedAtendente = await atendenteRepository.updateAtendente(
      id,
      existingAtendente.tenantId,
      name,
      status,
    );

    if (!updatedAtendente) {
      throw new ApiError(404, 'Atendente não encontrado para atualização.');
    }

    res.status(200).json({ message: 'Atendente atualizado com sucesso!', atendente: updatedAtendente });
  }),

  deleteAtendente: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

    const existingAtendente = await atendenteRepository.getAtendenteById(id, tenantId);
    if (!existingAtendente) {
      throw new ApiError(404, 'Atendente não encontrado para deleção.');
    }

    if (
      requestingUser.role !== 'Super Admin' &&
      existingAtendente.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(403, 'Você não tem permissão para deletar este atendente.');
    }

    const deletedRows = await atendenteRepository.deleteAtendente(id, existingAtendente.tenantId);

    if (deletedRows === 0) {
      throw new ApiError(404, 'Atendente não encontrado para deleção.');
    }

    res.status(200).json({ message: 'Atendente deletado com sucesso.' });
  }),
};

module.exports = atendenteController;
