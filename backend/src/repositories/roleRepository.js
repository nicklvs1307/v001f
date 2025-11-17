const { Role } = require("../../models"); // Importa o modelo do Sequelize

const getAllRoles = async () => {
  return Role.findAll({
    attributes: ["id", "name", "description"],
    order: [["name", "ASC"]],
  });
};

module.exports = {
  getAllRoles,
};
