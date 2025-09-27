'use strict';
const { Roleta } = require('../../models');

const createRoleta = async (roletaData) => {
  return Roleta.create(roletaData);
};

const findAllByTenant = async (tenantId) => {
  return Roleta.findAll({ where: { tenantId } });
};

const findById = async (id, tenantId) => {
  return Roleta.findOne({ where: { id, tenantId } });
};

const updateRoleta = async (id, tenantId, updateData) => {
  const [updatedRows] = await Roleta.update(updateData, {
    where: { id, tenantId },
  });
  return updatedRows;
};

const deleteRoleta = async (id, tenantId) => {
  return Roleta.destroy({ where: { id, tenantId } });
};

module.exports = {
  createRoleta,
  findAllByTenant,
  findById,
  updateRoleta,
  deleteRoleta,
};
