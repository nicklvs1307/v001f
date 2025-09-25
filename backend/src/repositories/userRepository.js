const { Usuario, Role } = require("../../models"); // Importa os modelos do Sequelize
const { Op } = require('sequelize');

const findByEmail = async (email, tenantId = null) => {
  const whereClause = tenantId ? { email, tenantId } : { email };
  return Usuario.findOne({ where: whereClause });
};

const findRoleById = async (roleId) => {
  return Role.findByPk(roleId);
};

const createUser = async (tenantId, roleId, name, email, passwordHash) => {
  const newUser = await Usuario.create({
    tenantId,
    roleId,
    name,
    email,
    passwordHash,
  });
  return {
    id: newUser.id,
    tenantId: newUser.tenantId,
    roleId: newUser.roleId,
    name: newUser.name,
    email: newUser.email,
    profilePictureUrl: newUser.profilePictureUrl,
  };
};

const getUsers = async (tenantId = null) => {
  const whereClause = tenantId ? { tenantId } : {};

  return Usuario.findAll({
    where: whereClause,
    include: [{ model: Role, as: 'role', attributes: ['name'] }],
    order: [['name', 'ASC']],
    attributes: ['id', 'tenantId', 'name', 'email', 'roleId', 'profilePictureUrl'], // Incluir profilePictureUrl
  }).then(users => users.map(user => ({
    ...user.toJSON(), // Converte a instância do modelo para um objeto JSON
    roleName: user.role ? user.role.name : null // Mapeia o nome da role para roleName
  })));
};

const findById = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, tenantId } : { id };
  return Usuario.findByPk(id, {
    where: whereClause,
    include: [{ model: Role, as: 'role', attributes: ['name'] }],
    attributes: ['id', 'tenantId', 'name', 'email', 'roleId', 'profilePictureUrl'], // Incluir profilePictureUrl
  }).then(user => user ? { ...user.toJSON(), roleName: user.role ? user.role.name : null } : null);
};

const findUserById = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, tenantId } : { id };
  return Usuario.findByPk(id, {
    where: whereClause,
    attributes: ['tenantId', 'roleId'],
  });
};

const updateUser = async (id, name, email, roleId, passwordHash, tenantId = null) => {
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (roleId) updateData.roleId = roleId;
  if (passwordHash) updateData.passwordHash = passwordHash;

  const whereClause = tenantId ? { id, tenantId } : { id };

  const [updatedRows] = await Usuario.update(updateData, {
    where: whereClause,
    returning: true, // Retorna os dados atualizados
  });

  if (updatedRows === 0) {
    return null; // Nenhum usuário encontrado para atualizar
  }

  const updatedUser = await Usuario.findByPk(id, {
    attributes: ['id', 'tenantId', 'roleId', 'name', 'email', 'profilePictureUrl'], // Incluir profilePictureUrl no retorno
  });
  return updatedUser;
};

const deleteUser = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, tenantId } : { id };
  const deletedRows = await Usuario.destroy({
    where: whereClause,
  });
  return deletedRows; // Retorna o número de linhas deletadas
};

const getUserProfilePictureUrlById = async (id) => {
  const user = await Usuario.findByPk(id, {
    attributes: ['profilePictureUrl'],
  });
  return user ? user.profilePictureUrl : null;
};

module.exports = {
  findByEmail,
  findRoleById,
  createUser,
  getUsers,
  findById,
  findUserById,
  updateUser,
  deleteUser,
  getUserProfilePictureUrlById,
};
