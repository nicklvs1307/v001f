"use strict";
const { RoletaPremio, Recompensa } = require("../../models");

const createPremio = async (premioData) => {
  return RoletaPremio.create(premioData);
};

const findAll = async ({ tenantId, roletaId }) => {
  const whereClause = { tenantId };
  if (roletaId) {
    whereClause.roletaId = roletaId;
  }
  return RoletaPremio.findAll({
    where: whereClause,
    include: [{ model: Recompensa, as: "recompensa" }],
    order: [["nome", "ASC"]],
  });
};

const findById = async (id, tenantId) => {
  return RoletaPremio.findOne({
    where: { id, tenantId },
    include: [{ model: Recompensa, as: "recompensa" }],
  });
};

const updatePremio = async (id, tenantId, updateData) => {
  const [updatedRows] = await RoletaPremio.update(updateData, {
    where: { id, tenantId },
  });
  return updatedRows;
};

const deletePremio = async (id, tenantId) => {
  return RoletaPremio.destroy({ where: { id, tenantId } });
};

module.exports = {
  createPremio,
  findAll,
  findById,
  updatePremio,
  deletePremio,
};
