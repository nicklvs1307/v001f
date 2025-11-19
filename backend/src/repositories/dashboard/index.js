const { getMainDashboard } = require("./main");
const {
  getDetailsByCategory,
  getResponseDetailsBySessionId: getResponseDetails,
} = require("./details");
const { getAttendantDetails } = require("./attendants");
const { getMonthlySummary: getMonthSummary } = require("./summary");

module.exports = {
  getMainDashboard,
  getDetailsByCategory,
  getAttendantDetails,
  getResponseDetails,
  getMonthSummary,
};