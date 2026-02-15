const tenantMiddleware = (req, res, next) => {
  let tenantId;

  // Super Admin pode especificar um tenantId na query, ou ter acesso a todos (null)
  if (req.user.role.name === "Super Admin") {
    tenantId =
      req.query.tenantId || req.params.tenantId || req.body.tenantId || null;
  } else {
    // Outros usuários são restritos ao seu próprio tenantId
    tenantId = req.user.tenantId;
    // Garante que um usuário não-admin não possa bisbilhotar outros tenants
    if (!tenantId) {
      return res.status(403).json({
        message: "Acesso negado: Tenant ID não encontrado para este usuário.",
      });
    }
  }

  req.tenantId = tenantId;
  next();
};

module.exports = tenantMiddleware;
