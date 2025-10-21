const { Recompensa, Tenant } = require("../../models");
const { Op } = require('sequelize');

const createRecompensa = async (tenantId, name, description, pointsRequired, active) => {
  return Recompensa.create({ tenantId, name, description, pointsRequired, active });
};

const getAllRecompensas = async (tenantId, activeOnly = false) => {
  const whereClause = tenantId ? { tenantId } : {};
  if (activeOnly) {
    whereClause.active = true;
  }
  return Recompensa.findAll({
    where: whereClause,
    order: [['name', 'ASC']],
  });
};

const findById = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, tenantId } : { id };
  return Recompensa.findOne({ where: whereClause });
};

const updateRecompensa = async (id, tenantId, name, description, pointsRequired, active) => {
  const [updatedRows, [updatedRecompensa]] = await Recompensa.update(
    { name, description, pointsRequired, active },
    { where: { id, tenantId }, returning: true }
  );
  return updatedRecompensa;
};

const deleteRecompensa = async (id, tenantId) => {
  return Recompensa.destroy({ where: { id, tenantId } });
};

module.exports = {
  createRecompensa,
  getAllRecompensas,
  findById,
  updateRecompensa,
  deleteRecompensa,
};
