const { Op } = require("sequelize");

/**
 * Constrói uma cláusula 'where' para consultas Sequelize de forma padronizada.
 * @param {object} [options={}] - As opções para construir a cláusula.
 * @param {string} [options.tenantId] - O ID do tenant para filtrar.
 * @param {string} [options.surveyId] - O ID da pesquisa para filtrar.
 * @param {object} [options.dateRange] - O objeto com startDate e endDate.
 * @param {Date} [options.dateRange.startDate] - A data de início do filtro.
 * @param {Date} [options.dateRange.endDate] - A data de fim do filtro.
 * @param {string} [options.dateField='createdAt'] - O nome do campo de data para filtrar.
 * @returns {object} A cláusula 'where' do Sequelize.
 */
function buildWhereClause(options = {}) {
  const { tenantId, surveyId, dateRange, dateField = 'createdAt' } = options;
  const where = {};

  if (tenantId) {
    where.tenantId = tenantId;
  }
  if (surveyId) {
    where.pesquisaId = surveyId;
  }
  if (dateRange && dateRange.startDate && dateRange.endDate) {
    where[dateField] = { [Op.between]: [dateRange.startDate, dateRange.endDate] };
  } else if (dateRange && dateRange.startDate) {
    where[dateField] = { [Op.gte]: dateRange.startDate };
  } else if (dateRange && dateRange.endDate) {
    where[dateField] = { [Op.lte]: dateRange.endDate };
  }

  return where;
}

module.exports = { buildWhereClause };
