const asyncHandler = require("express-async-handler");
const { Permissao, Role, RolePermissao, sequelize } = require("../../../models");
const ApiError = require("../../../errors/ApiError");

// @desc    Listar todas as permissões disponíveis no sistema
// @route   GET /api/superadmin/permissions
// @access  Super Admin
exports.getAllPermissions = asyncHandler(async (req, res) => {
  // Agrupar permissões por módulo para facilitar o frontend
  const permissions = await Permissao.findAll({
    order: [['module', 'ASC'], ['action', 'ASC']]
  });
  res.json(permissions);
});

// @desc    Listar todos os papéis (Roles) do sistema
// @route   GET /api/superadmin/roles
// @access  Super Admin
exports.getAllSystemRoles = asyncHandler(async (req, res) => {
  const roles = await Role.findAll({
    include: [{
      model: Permissao,
      as: 'permissoes',
      attributes: ['id', 'module', 'action'],
      through: { attributes: [] }
    }],
    order: [['name', 'ASC']]
  });
  res.json(roles);
});

// @desc    Atualizar permissões de um papel
// @route   PUT /api/superadmin/roles/:roleId/permissions
// @access  Super Admin
exports.updateRolePermissions = asyncHandler(async (req, res) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body;

  if (!Array.isArray(permissionIds)) {
    throw new ApiError(400, "permissionIds deve ser um array de IDs.");
  }

  const role = await Role.findByPk(roleId);
  if (!role) {
    throw new ApiError(404, "Papel (Role) não encontrado.");
  }

  // Transação para garantir integridade
  const t = await sequelize.transaction();

  try {
    // 1. Remover todas as permissões atuais desse cargo
    await RolePermissao.destroy({
      where: { roleId },
      transaction: t
    });

    // 2. Inserir as novas permissões
    if (permissionIds.length > 0) {
      const newPermissions = permissionIds.map(permId => ({
        roleId,
        permissaoId: permId
      }));
      
      await RolePermissao.bulkCreate(newPermissions, { transaction: t });
    }

    await t.commit();

    // Retornar o role atualizado com as permissões
    const updatedRole = await Role.findByPk(roleId, {
      include: [{
        model: Permissao,
        as: 'permissoes',
        attributes: ['id', 'module', 'action'],
        through: { attributes: [] }
      }]
    });

    res.json(updatedRole);

  } catch (error) {
    await t.rollback();
    throw new ApiError(500, "Erro ao atualizar permissões do cargo.");
  }
});
