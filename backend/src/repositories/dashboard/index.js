const { getMainDashboard } = require("./main");
const {
  getDetailsByCategory,
  getResponseDetailsBySessionId: getResponseDetails,
} = require("./details");
const { getAttendantDetails } = require("./attendants");
const { getMonthlySummary: getMonthSummary } = require("./summary");
const { getAllFeedbacksForPeriod } = require("./feedbacks");

module.exports = {
  getMainDashboard,
  getDetailsByCategory,
  getAttendantDetails,
  getResponseDetails,
  getMonthSummary,
  getAllFeedbacksForPeriod,
};