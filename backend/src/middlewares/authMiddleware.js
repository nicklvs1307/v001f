const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../errors/ApiError"); // Importar ApiError
const { Role, Permissao, RolePermissao } = require("../../models"); // Importa os modelos do Sequelize

// Middleware para verificar o token e autenticar o usuário
const protect = async (req, res, next) => {
  try {
    console.log(`[Auth Middleware] Request: ${req.method} ${req.originalUrl}`);

    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
      throw new ApiError(401, "Nenhum token fornecido. Acesso não autorizado.");
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    // Buscar o usuário no banco de dados para garantir que os dados estão atualizados
    const { Usuario } = require("../../models");
    const user = await Usuario.findByPk(decoded.userId);

    if (!user) {
      throw new ApiError(401, "Usuário do token não encontrado.");
    }

    // Anexar o objeto de usuário do Sequelize à requisição
    req.user = user;

    next();
  } catch (error) {
    console.error('Erro no middleware de proteção:', error.message);
    // Cria um novo ApiError para padronizar a resposta de erro de autenticação
    const authError = new ApiError(401, "Token inválido ou expirado. Acesso não autorizado.");
    next(authError); // Passa o erro padronizado para o Express
  }
};

// Middleware de autorização baseado em permissões
const authorize = (requiredPermissionOrRoles) => {
  return async (req, res, next) => {
    try {
      // Adicionar verificação defensiva para req.user
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Acesso não autorizado: Informações do usuário ausentes." });
      }

      const userRoleName = req.user.role;
      if (!userRoleName) {
        return res
          .status(403)
          .json({ message: "Usuário não tem um papel definido." });
      }

      // Se o usuário for Super Admin, ele tem acesso total
      if (userRoleName === 'Super Admin') {
        return next();
      }

      // Se requiredPermissionOrRoles for um array, significa que estamos verificando por papéis específicos
      if (Array.isArray(requiredPermissionOrRoles)) {
        if (requiredPermissionOrRoles.includes(userRoleName)) {
          return next(); // Usuário tem um dos papéis necessários
        } else {
          console.log(`Authorization failed for user role: ${userRoleName}, required roles: ${requiredPermissionOrRoles.join(', ')}`);
          return res.status(403).json({ message: "Você não tem permissão para acessar este recurso." });
        }
      }

      // 1. Encontrar o ID do papel (role) usando o modelo Role
      const role = await Role.findOne({ where: { name: userRoleName } });
      if (!role) {
        return res
          .status(403)
          .json({ message: "Papel do usuário não encontrado no sistema." });
      }
      const roleId = role.id;

      // 2. Separar o módulo e a ação da permissão requerida (ex: 'surveys:create')
      const [module, action] = requiredPermissionOrRoles.split(":");

      // 3. Verificar se o papel do usuário tem a permissão necessária
      console.log(`[Authorize Debug] User Role: ${userRoleName}, Required: ${requiredPermissionOrRoles}`);
      console.log(`[Authorize Debug] Role ID: ${roleId}, Module: ${module}, Action: ${action}`);

      const hasPermission = await RolePermissao.findOne({
        where: { roleId: roleId },
        include: [{
          model: Permissao,
          as: 'permissao', // Certifique-se de que 'as' corresponde à associação definida no modelo RolePermissao
          where: { module, action },
          required: true // Garante que a permissão deve existir
        }]
      });

      console.log(`[Authorize Debug] Has Permission Result: ${!!hasPermission}`);

      if (hasPermission) {
        // O usuário tem a permissão, pode prosseguir
        next();
      } else {
        console.log(`Authorization failed for user role: ${userRoleName}, required permission: ${requiredPermissionOrRoles}`);
        // O usuário não tem a permissão
        return res
          .status(403)
          .json({ message: "Você não tem permissão para executar esta ação." });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Erro no servidor ao verificar permissões." });
    }
  };
};

module.exports = { protect, authorize };
