const asyncHandler = require("express-async-handler");
const roleRepository = require("../repositories/roleRepository");
const ApiError = require("../errors/ApiError");

// @desc    Listar todos os papéis (roles)
// @route   GET /api/roles
// @access  Private (Qualquer usuário com permissão de gerenciar usuários)
exports.getAllRoles = asyncHandler(async (req, res) => {
  const roles = await roleRepository.getAllRoles();
  res.status(200).json(roles);
});
