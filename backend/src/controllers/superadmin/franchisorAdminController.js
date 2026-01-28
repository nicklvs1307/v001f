const asyncHandler = require("express-async-handler");
const franchisorRepository = require("../../repositories/franchisorRepository");
const ApiError = require("../../errors/ApiError");

// @desc    Criar uma nova franqueadora
// @route   POST /api/superadmin/franchisors
// @access  Private (Super Admin)
exports.createFranchisor = asyncHandler(async (req, res) => {
  const { name, cnpj, email, phone } = req.body;

  if (!name) {
    throw new ApiError(400, "O nome da franqueadora é obrigatório.");
  }

  const franchisorData = { name, cnpj, email, phone };
  const newFranchisor = await franchisorRepository.create(franchisorData);

  res.status(201).json({
    message: "Franqueadora criada com sucesso!",
    franchisor: newFranchisor,
  });
});

// @desc    Listar todas as franqueadoras
// @route   GET /api/superadmin/franchisors
// @access  Private (Super Admin)
exports.getAllFranchisors = asyncHandler(async (req, res) => {
  const franchisors = await franchisorRepository.findAll();
  res.status(200).json(franchisors);
});

// @desc    Obter uma franqueadora por ID
// @route   GET /api/superadmin/franchisors/:id
// @access  Private (Super Admin)
exports.getFranchisorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const franchisor = await franchisorRepository.findById(id);

  if (!franchisor) {
    throw new ApiError(404, "Franqueadora não encontrada.");
  }

  res.status(200).json(franchisor);
});

// @desc    Atualizar uma franqueadora
// @route   PUT /api/superadmin/franchisors/:id
// @access  Private (Super Admin)
exports.updateFranchisor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, cnpj, email, phone } = req.body;

  const franchisorData = { name, cnpj, email, phone };
  const updatedFranchisor = await franchisorRepository.update(
    id,
    franchisorData,
  );

  if (!updatedFranchisor) {
    throw new ApiError(404, "Franqueadora não encontrada para atualização.");
  }

  res.status(200).json({
    message: "Franqueadora atualizada com sucesso!",
    franchisor: updatedFranchisor,
  });
});

// @desc    Deletar uma franqueadora
// @route   DELETE /api/superadmin/franchisors/:id
// @access  Private (Super Admin)
exports.deleteFranchisor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedRowCount = await franchisorRepository.delete(id);

  if (deletedRowCount === 0) {
    throw new ApiError(404, "Franqueadora não encontrada para deleção.");
  }

  // A lógica onDelete: 'SET NULL' na migração cuidará de desvincular os tenants.
  res.status(200).json({
    message:
      "Franqueadora deletada com sucesso. Os tenants associados foram desvinculados.",
  });
});
