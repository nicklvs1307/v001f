const { getSummary } = require('./summary');
const { getResponseChart, getNpsTrendData, getConversionChart } = require('./charts');
const { getAttendantsPerformanceWithGoals } = require('./attendants');
const { getCriteriaScores } = require('./criteria');
const { getFeedbacks, getWordCloudData } = require('./feedbacks');
const { getNpsByDayOfWeek } = require('./nps');
const { getOverallResults } = require('./overall');
const { getBirthdaysOfMonth, getClientStatusCounts } = require('./clients');


const getMainDashboard = async function (tenantId = null, startDate = null, endDate = null, surveyId = null) {
    // Ensure startDate and endDate are Date objects for calculations
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    let npsTrendPeriod = 'day';
    if (start && end) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 90) {
            npsTrendPeriod = 'month';
        } else if (diffDays > 31) {
            npsTrendPeriod = 'week';
        }
    }

    const summary = await getSummary(tenantId, startDate, endDate, surveyId);
    const responseChart = await getResponseChart(tenantId, startDate, endDate, surveyId);
    const attendantsPerformance = await getAttendantsPerformanceWithGoals(tenantId, startDate, endDate, surveyId);
    const criteriaScores = await getCriteriaScores(tenantId, startDate, endDate, surveyId);
    const feedbacks = await getFeedbacks(tenantId, startDate, endDate, surveyId);
    const conversionChart = await getConversionChart(tenantId, startDate, endDate, surveyId);
    const npsByDayOfWeek = await getNpsByDayOfWeek(tenantId, startDate, endDate, surveyId);
    const npsTrend = await getNpsTrendData(tenantId, npsTrendPeriod, startDate, endDate, surveyId);
    const overallResults = await getOverallResults(tenantId, startDate, endDate, surveyId);
    const birthdaysOfMonth = await getBirthdaysOfMonth(tenantId);
    const wordCloudData = await getWordCloudData(tenantId, startDate, endDate, surveyId);
    const clientStatusCounts = await getClientStatusCounts(tenantId, startDate, endDate);


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
        birthdaysOfMonth,
        wordCloudData,
        clientStatusCounts,
    };
};

module.exports = {
    getMainDashboard,
};