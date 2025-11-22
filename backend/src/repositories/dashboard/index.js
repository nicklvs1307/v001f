const { getMainDashboard } = require("./main");
const {
  getDetailsByCategory,
  getResponseDetailsBySessionId: getResponseDetails,
} = require("./details");
const { getAttendantDetails } = require("./attendants");
const { getMonthlySummary: getMonthSummary } = require("./summary");
const { getAllFeedbacksForPeriod, getWordCloudData } = require("./feedbacks");
const { getEvolutionDashboard } = require("./charts");

module.exports = {
  getMainDashboard,
  getDetailsByCategory,
  getAttendantDetails,
  getResponseDetails,
  getMonthSummary,
  getAllFeedbacksForPeriod,
  getWordCloudData,
  getEvolutionDashboard,
};
