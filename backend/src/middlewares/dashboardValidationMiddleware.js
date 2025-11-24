const { check } = require("express-validator");

const validateDateFilters = [
  check("startDate", "Data de início inválida")
    .optional()
    .isISO8601()
    .toDate(),
  check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
  check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
];

const validatePeriodFilter = [
  check("period", "Período inválido. Use 'day', 'week' ou 'month'.")
    .optional()
    .isIn(["day", "week", "month"]),
  ...validateDateFilters,
];

module.exports = {
  validateDateFilters,
  validatePeriodFilter,
};