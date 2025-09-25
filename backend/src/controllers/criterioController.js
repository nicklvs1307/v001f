const asyncHandler = require("express-async-handler");
const criterioRepository = require("../repositories/criterioRepository"); // Será criado em breve
const ApiError = require("../errors/ApiError");

// @desc    Criar um novo critério
// @access  Private (Super Admin ou Admin)
exports.createCriterio = asyncHandler(async (req, res) => {
  const { name, description, type } = req.body; // Adicionado type
  const requestingUser = req.user;

  // Lógica para criar o critério
  const newCriterio = await criterioRepository.createCriterio({
    name,
    description,
    type, // Adicionado type
    tenantId: requestingUser.tenantId, // Associa o critério ao tenant do usuário logado
  });

  res.status(201).json(newCriterio);
});

// @desc    Obter todos os critérios
// @access Private (Super Admin, Admin, Survey Creator, Survey Viewer)
exports.getAllCriterios = asyncHandler(async (req, res) => {
  const requestingUser = req.user;
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

  const criterios = await criterioRepository.getAllCriterios(tenantId);
  res.status(200).json(criterios);
});

// @desc    Obter um critério por ID
// @route   GET /api/criterios/:id
// @access  Private (Super Admin, Admin, Survey Creator, Survey Viewer)
exports.getCriterioById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

  const criterio = await criterioRepository.getCriterioById(id, tenantId);

  if (!criterio) {
    throw new ApiError(404, "Critério não encontrado.");
  }

  // Super Admin pode ver qualquer critério
  // Outros usuários só podem ver critérios do seu próprio tenant
  if (
    requestingUser.role !== "Super Admin" &&
    criterio.tenantId !== requestingUser.tenantId
  ) {
    throw new ApiError(403, "Você não tem permissão para ver este critério.");
  }

  res.status(200).json(criterio);
});

// @desc    Atualizar um critério
// @access  Private (Super Admin ou Admin)
exports.updateCriterio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, type } = req.body;
  const requestingUser = req.user;
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

  const existingCriterio = await criterioRepository.getCriterioById(id, tenantId);
  if (!existingCriterio) {
    throw new ApiError(404, "Critério não encontrado.");
  }

  // Super Admin pode atualizar qualquer critério
  // Admin só pode atualizar critérios do seu próprio tenant
  if (
    requestingUser.role !== "Super Admin" &&
    existingCriterio.tenantId !== requestingUser.tenantId
  ) {
    throw new ApiError(403, "Você não tem permissão para atualizar este critério.");
  }

  const updatedCriterio = await criterioRepository.updateCriterio(
    id,
    existingCriterio.tenantId, // Usar o tenantId do critério existente para garantir que o update seja no tenant correto
    name,
    description,
    type,
  );

  if (!updatedCriterio) {
    throw new ApiError(404, "Critério não encontrado para atualização.");
  }

  res.status(200).json({ message: "Critério atualizado com sucesso!", criterio: updatedCriterio });
});

// @desc    Deletar um critério
// @route   DELETE /api/criterios/:id
// @access  Private (Super Admin ou Admin)
exports.deleteCriterio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

  const existingCriterio = await criterioRepository.getCriterioById(id, tenantId);
  if (!existingCriterio) {
    throw new ApiError(404, "Critério não encontrado para deleção.");
  }

  // Super Admin pode deletar qualquer critério
  // Admin só pode deletar critérios do seu próprio tenant
  if (
    requestingUser.role !== "Super Admin" &&
    existingCriterio.tenantId !== requestingUser.tenantId
  ) {
    throw new ApiError(403, "Você não tem permissão para deletar este critério.");
  }

  const deletedRows = await criterioRepository.deleteCriterio(id, existingCriterio.tenantId);

  if (deletedRows === 0) {
    throw new ApiError(404, "Critério não encontrado para deleção.");
  }

  res.status(200).json({ message: "Critério deletado com sucesso." });
});
