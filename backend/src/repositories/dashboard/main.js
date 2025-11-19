const { getSummary } = require("./summary");
const {
  getResponseChart,
  getNpsTrendData,
  getConversionChart,
} = require("./charts");
const { getAttendantsPerformanceWithGoals } = require("./attendants");
const { getCriteriaScores } = require("./criteria");
const { getFeedbacks, getWordCloudData } = require("./feedbacks");
const { getNpsByDayOfWeek } = require("./nps");
const { getUtcDateRange } = require("../../utils/dateUtils");

const getMainDashboard = async function (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) {
  const { startDate, endDate } = getUtcDateRange(startDateStr, endDateStr);

  let npsTrendPeriod = "day";
  if (startDate && endDate) {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      npsTrendPeriod = "month";
    } else if (diffDays > 31) {
      npsTrendPeriod = "week";
    }
  }

  const [
    summary,
    responseChart,
    attendantsPerformance,
    feedbacks,
    conversionChart,
    npsByDayOfWeek,
    npsTrend,
    wordCloudData,
  ] = await Promise.all([
    getSummary(tenantId, startDateStr, endDateStr, surveyId),
    getResponseChart(tenantId, startDate, endDate, surveyId),
    getAttendantsPerformanceWithGoals(tenantId, startDate, endDate, surveyId),
    getFeedbacks(tenantId, startDate, endDate, surveyId),
    getConversionChart(tenantId, startDate, endDate, surveyId),
    getNpsByDayOfWeek(tenantId, startDate, endDate, surveyId),
    getNpsTrendData(tenantId, npsTrendPeriod, startDate, endDate, surveyId),
    getWordCloudData(tenantId, startDate, endDate, surveyId),
  ]);

  return {
    summary,
    responseChart,
    attendantsPerformance,
    feedbacks,
    conversionChart,
    npsByDayOfWeek,
    npsTrend,
    wordCloudData,
  };
};
module.exports = {
  getMainDashboard,
};
