const ApiError = require("../errors/ApiError");

/**
 * Valida o acesso do usuário ao tenant e retorna o tenantId alvo.
 *
 * Regras:
 * 1. Se Super Admin: Pode agir em qualquer tenant (passado via body/query) ou no seu próprio.
 * 2. Se Admin/User: Só pode agir no próprio tenantId.
 *
 * @param {Object} user - O objeto req.user (requestingUser)
 * @param {string} requestedTenantId - O tenantId solicitado na requisição (opcional)
 * @returns {string} O tenantId validado para a operação
 * @throws {ApiError} Se o tenantId for inválido ou não permitido
 */
const validateTenantAccess = (user, requestedTenantId = null) => {
  const isSuperAdmin = user.role && user.role.name === "Super Admin";

  if (isSuperAdmin) {
    // Super Admin pode escolher o tenant, ou usar o seu se nenhum for passado
    return requestedTenantId || user.tenantId;
  }

  // Usuários comuns (incluindo Admin local) estão presos ao seu tenant
  const targetTenantId = user.tenantId;

  // Se o usuário tentar acessar outro tenant explicitamente, bloqueamos
  if (requestedTenantId && requestedTenantId !== targetTenantId) {
    throw new ApiError(403, "Acesso negado a este tenant.");
  }

  return targetTenantId;
};

/**
 * Verifica se o recurso pertence ao tenant do usuário.
 * Útil para operações em recursos existentes (GET by ID, UPDATE, DELETE).
 *
 * @param {Object} resource - O objeto do banco de dados (deve ter tenantId)
 * @param {Object} user - O objeto req.user
 * @throws {ApiError} Se o recurso não pertencer ao tenant permitido
 */
const checkResourceTenant = (resource, user) => {
  const isSuperAdmin = user.role && user.role.name === "Super Admin";

  if (!resource) {
    throw new ApiError(404, "Recurso não encontrado.");
  }

  if (!isSuperAdmin && resource.tenantId !== user.tenantId) {
    throw new ApiError(
      403,
      "Você não tem permissão para acessar este recurso.",
    );
  }
};

module.exports = {
  validateTenantAccess,
  checkResourceTenant,
};
