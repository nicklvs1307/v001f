'use strict';
const { Roleta, RoletaPremio } = require('../../models');

const createRoleta = async (roletaData, transaction) => {
  return Roleta.create(roletaData, { transaction });
};

const updateRoleta = async (id, tenantId, updateData, transaction) => {
  const [updatedRows] = await Roleta.update(updateData, {
    where: { id, tenantId },
    transaction,
  });
  return updatedRows;
};

const deletePremiosByRoletaId = async (roletaId, transaction) => {
  return RoletaPremio.destroy({ where: { roletaId }, transaction });
};

const bulkCreatePremios = async (premios, transaction) => {
  return RoletaPremio.bulkCreate(premios, { transaction });
};


const findAllByTenant = async (tenantId) => {
  return Roleta.findAll({
    where: { tenantId },
    include: [{ model: RoletaPremio, as: 'premios' }]
  });
};

const findById = async (id, tenantId) => {
  return Roleta.findOne({
    where: { id, tenantId },
    include: [{ model: RoletaPremio, as: 'premios' }],
  });
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
  deletePremiosByRoletaId,
  bulkCreatePremios,
};
