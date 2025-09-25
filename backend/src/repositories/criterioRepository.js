const { Criterio } = require("../../models");
const { Op } = require('sequelize');

// Funções CRUD para Criterio
const createCriterio = async (criterioData) => {
  return Criterio.create(criterioData);
};

const getAllCriterios = async (tenantId) => {
  const whereClause = tenantId ? { tenantId } : {};
  return Criterio.findAll({
    where: whereClause,
    order: [['name', 'ASC']],
  });
};

const getCriterioById = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, tenantId } : { id };
  return Criterio.findOne({ where: whereClause });
};

const updateCriterio = async (id, tenantId, name, description, type) => {
  const [updatedRows, [updatedCriterio]] = await Criterio.update(
    { name, description, type },
    { where: { id, tenantId }, returning: true }
  );
  return updatedCriterio;
};

const deleteCriterio = async (id, tenantId) => {
  return Criterio.destroy({ where: { id, tenantId } });
};

module.exports = {
  createCriterio,
  getAllCriterios,
  getCriterioById,
  updateCriterio,
  deleteCriterio,
};
