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
const { getOverallResults } = require("./overall");
const { getClientStatusCounts } = require("./clients");
const { getUtcDateRange } = require("../../utils/dateUtils"); // Import the new utility

const getMainDashboard = async function (
  tenantId = null,
  startDateStr = null, // Renamed to avoid confusion with Date objects
  endDateStr = null,   // Renamed to avoid confusion with Date objects
  surveyId = null,
) {
  const { startDate, endDate } = getUtcDateRange(startDateStr, endDateStr);

  let npsTrendPeriod = "day";
  if (startDate && endDate) {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime()); // Use getTime() for Date objects
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      npsTrendPeriod = "month";
    } else if (diffDays > 31) {
      npsTrendPeriod = "week";
    }
  }

  const summary = await getSummary(
    tenantId,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
    surveyId,
  );
  const responseChart = await getResponseChart(
    tenantId,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
    surveyId,
  );
  const attendantsPerformance = await getAttendantsPerformanceWithGoals(
    tenantId,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
    surveyId,
  );
  const criteriaScores = await getCriteriaScores(
    tenantId,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
    surveyId,
  );
  const feedbacks = await getFeedbacks(
    tenantId,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
    surveyId,
  );
  const conversionChart = await getConversionChart(
    tenantId,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
    surveyId,
  );
  const npsByDayOfWeek = await getNpsByDayOfWeek(
    tenantId,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
    surveyId,
  );
  const npsTrend = await getNpsTrendData(
    tenantId,
    npsTrendPeriod,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
    surveyId,
  );
  const overallResults = await getOverallResults(
    tenantId,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
    surveyId,
  );

  const wordCloudData = await getWordCloudData(
    tenantId,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
    surveyId,
  );
  const clientStatusCounts = await getClientStatusCounts(
    tenantId,
    startDate, // Pass UTC Date objects
    endDate,   // Pass UTC Date objects
  );

  return {
    summary,
    responseChart,
    attendantsPerformance,
    criteriaScores,
    feedbacks,
    conversionChart,
    npsByDayOfWeek,
    npsTrend,
    overallResults,
    wordCloudData,
    clientStatusCounts,
  };
};
module.exports = {
  getMainDashboard,
};
