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

const getMainDashboard = async function (
  tenantId = null,
  startDate = null,
  endDate = null,
  surveyId = null,
) {
  const isValidDate = (dateStr) => dateStr && !isNaN(new Date(dateStr));
  const validStartDate = isValidDate(startDate) ? startDate : null;
  const validEndDate = isValidDate(endDate) ? endDate : null;

  // Ensure startDate and endDate are Date objects for calculations
  const start = validStartDate ? new Date(validStartDate) : null;
  const end = validEndDate ? new Date(validEndDate) : null;

  let npsTrendPeriod = "day";
  if (start && end) {
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      npsTrendPeriod = "month";
    } else if (diffDays > 31) {
      npsTrendPeriod = "week";
    }
  }

  const summary = await getSummary(
    tenantId,
    validStartDate,
    validEndDate,
    surveyId,
  );
  const responseChart = await getResponseChart(
    tenantId,
    validStartDate,
    validEndDate,
    surveyId,
  );
  const attendantsPerformance = await getAttendantsPerformanceWithGoals(
    tenantId,
    validStartDate,
    validEndDate,
    surveyId,
  );
  const criteriaScores = await getCriteriaScores(
    tenantId,
    validStartDate,
    validEndDate,
    surveyId,
  );
  const feedbacks = await getFeedbacks(
    tenantId,
    validStartDate,
    validEndDate,
    surveyId,
  );
  const conversionChart = await getConversionChart(
    tenantId,
    validStartDate,
    validEndDate,
    surveyId,
  );
  const npsByDayOfWeek = await getNpsByDayOfWeek(
    tenantId,
    validStartDate,
    validEndDate,
    surveyId,
  );
  const npsTrend = await getNpsTrendData(
    tenantId,
    npsTrendPeriod,
    validStartDate,
    validEndDate,
    surveyId,
  );
  const overallResults = await getOverallResults(
    tenantId,
    validStartDate,
    validEndDate,
    surveyId,
  );

  const wordCloudData = await getWordCloudData(
    tenantId,
    validStartDate,
    validEndDate,
    surveyId,
  );
  const clientStatusCounts = await getClientStatusCounts(
    tenantId,
    validStartDate,
    validEndDate,
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
