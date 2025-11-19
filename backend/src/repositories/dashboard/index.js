const { getMainDashboard } = require("./main");
const { getDetails, getResponseDetailsBySessionId: getResponseDetails } = require("./details");
const { getAttendantDetails } = require("./attendants");
const { getMonthlySummary: getMonthSummary } = require("./summary");

module.exports = {
  getMainDashboard,
  getDetails,
  getAttendantDetails,
  getResponseDetails,
  getMonthSummary,
};