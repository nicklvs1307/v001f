const { Atendente, Tenant } = require("../../models");
const { Op } = require("sequelize");

const createAtendente = async (tenantId, name, status, code) => {
  return Atendente.create({ tenantId, name, status, code });
};

const getAllAtendentes = async (tenantId) => {
  const whereClause = tenantId ? { tenantId } : {};
  return Atendente.findAll({
    where: whereClause,
    order: [["name", "ASC"]],
  });
};

const getAtendenteById = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, tenantId } : { id };
  return Atendente.findOne({ where: whereClause });
};

const updateAtendente = async (id, tenantId, name, status) => {
  const [updatedRows, [updatedAtendente]] = await Atendente.update(
    { name, status },
    { where: { id, tenantId }, returning: true },
  );
  return updatedAtendente;
};

const deleteAtendente = async (id, tenantId) => {
  return Atendente.destroy({ where: { id, tenantId } });
};

module.exports = {
  createAtendente,
  getAllAtendentes,
  getAtendenteById,
  updateAtendente,
  deleteAtendente,
};
