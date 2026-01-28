const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { Usuario, Role, Tenant, ImpersonationLog } = require("../../models");
const config = require("../config");
const ApiError = require("../errors/ApiError");

const loginAsTenant = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  const superAdminId = req.user.id;

  // Melhoria: Encontra o primeiro usuário com o papel 'Admin' do tenant.
  const userToImpersonate = await Usuario.findOne({
    where: { tenantId },
    include: [
      {
        model: Role,
        as: "role",
        where: { name: "Admin" },
      },
    ],
    order: [["createdAt", "ASC"]], // Garante que pegue o admin mais antigo.
  });

  if (!userToImpersonate) {
    throw new ApiError(
      404,
      "Nenhum usuário administrador encontrado para este tenant.",
    );
  }

  // Melhoria: Criar log de auditoria
  await ImpersonationLog.create({
    superAdminId: superAdminId,
    impersonatedUserId: userToImpersonate.id,
    tenantId: tenantId,
  });

  // Cria o payload para o novo token, alinhado com o authController.
  const payload = {
    userId: userToImpersonate.id,
    name: userToImpersonate.name,
    role: userToImpersonate.role.name,
    tenantId: userToImpersonate.tenantId,
    profilePictureUrl: userToImpersonate.profilePictureUrl,
  };

  // Gera o novo token usando o padrão do projeto.
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  res.json({
    success: true,
    token: token,
    user: {
      id: userToImpersonate.id,
      name: userToImpersonate.name,
      email: userToImpersonate.email,
      role: userToImpersonate.role.name,
      tenantId: userToImpersonate.tenantId,
    },
  });
});

module.exports = {
  loginAsTenant,
};
