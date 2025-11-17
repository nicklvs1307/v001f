const { Usuario, Role, Tenant } = require("../../models"); // Importa os modelos do Sequelize

const findUserByEmail = async (email) => {
  return Usuario.findOne({
    where: { email },
    attributes: [
      "id",
      "name",
      "email",
      "passwordHash",
      "profilePictureUrl",
      "tenantId",
      "roleId",
    ],
    include: [{ model: Tenant, as: "tenant", attributes: ["name"] }],
  });
};

const findRoleByName = async (roleName) => {
  return Role.findOne({ where: { name: roleName } });
};

const createSuperAdminUser = async (roleId, name, email, passwordHash) => {
  const newUser = await Usuario.create({
    roleId,
    name,
    email,
    passwordHash,
  });
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    profilePictureUrl: newUser.profilePictureUrl,
  };
};

const getRoleNameByRoleId = async (roleId) => {
  const role = await Role.findByPk(roleId, {
    attributes: ["name"],
  });
  return role ? role.name : null;
};

const findSuperAdminUser = async () => {
  const superAdminRole = await findRoleByName("Super Admin");
  if (!superAdminRole) {
    return null;
  }
  return Usuario.findOne({ where: { roleId: superAdminRole.id } });
};

module.exports = {
  findUserByEmail,
  findRoleByName,
  createSuperAdminUser,
  getRoleNameByRoleId,
  findSuperAdminUser,
};
