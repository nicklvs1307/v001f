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
  const { startOfDayUtc, endOfDayUtc } = getUtcDateRange(startDateStr, endDateStr);

  // These 'start' and 'end' are now UTC Date objects
  const start = startOfDayUtc;
  const end = endOfDayUtc;

  let npsTrendPeriod = "day";
  if (start && end) {
    const diffTime = Math.abs(end.getTime() - start.getTime()); // Use getTime() for Date objects
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      npsTrendPeriod = "month";
    } else if (diffDays > 31) {
      npsTrendPeriod = "week";
    }
  }

  const summary = await getSummary(
    tenantId,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
    surveyId,
  );
  const responseChart = await getResponseChart(
    tenantId,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
    surveyId,
  );
  const attendantsPerformance = await getAttendantsPerformanceWithGoals(
    tenantId,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
    surveyId,
  );
  const criteriaScores = await getCriteriaScores(
    tenantId,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
    surveyId,
  );
  const feedbacks = await getFeedbacks(
    tenantId,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
    surveyId,
  );
  const conversionChart = await getConversionChart(
    tenantId,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
    surveyId,
  );
  const npsByDayOfWeek = await getNpsByDayOfWeek(
    tenantId,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
    surveyId,
  );
  const npsTrend = await getNpsTrendData(
    tenantId,
    npsTrendPeriod,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
    surveyId,
  );
  const overallResults = await getOverallResults(
    tenantId,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
    surveyId,
  );

  const wordCloudData = await getWordCloudData(
    tenantId,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
    surveyId,
  );
  const clientStatusCounts = await getClientStatusCounts(
    tenantId,
    startOfDayUtc, // Pass UTC Date objects
    endOfDayUtc,   // Pass UTC Date objects
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
