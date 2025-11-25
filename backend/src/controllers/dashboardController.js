const asyncHandler = require("express-async-handler");
const dashboardRepository = require("../repositories/dashboardRepository");
const { getPeriodDateRange } = require("../utils/dateUtils");

// Objeto que mapeia as rotas para as funções do repositório
module.exports = {
  getDashboardData: asyncHandler(async (req, res) => {
    const { startDate, endDate, period, surveyId } = req.query;
    const dashboardData = await dashboardRepository.getDashboardData(
      req.tenantId,
      startDate,
      endDate,
      period,
      surveyId
    );
    res.status(200).json(dashboardData);
  }),

  getSummary: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const summary = await dashboardRepository.getSummary(
      req.tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(summary);
  }),

  getResponseChart: asyncHandler(async (req, res) => {
    const { startDate, endDate, period } = req.query;
    const chartData = await dashboardRepository.getResponseChart(
      req.tenantId,
      startDate,
      endDate,
      period,
    );
    res.status(200).json(chartData);
  }),

  getRanking: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const performanceData = await dashboardRepository.getAttendantsPerformance(
      req.tenantId,
      startDate,
      endDate,
    );

    // Ordena o ranking pelo NPS (maior para o menor)
    const ranking = performanceData.sort((a, b) => b.currentNPS - a.currentNPS);

    res.status(200).json(ranking);
  }),

  getCriteriaScores: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const criteriaScores = await dashboardRepository.getNpsByCriteria(
      req.tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(criteriaScores);
  }),

  getFeedbacks: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const feedbacks = await dashboardRepository.getFeedbacks(
      req.tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(feedbacks);
  }),

  getConversionChart: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const chartData = await dashboardRepository.getConversionChartData(
      req.tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(chartData);
  }),

  getNpsTrend: asyncHandler(async (req, res) => {
    const { period, startDate, endDate } = req.query;
    const trendData = await dashboardRepository.getNpsTrendData(
      req.tenantId,
      period,
      startDate,
      endDate,
    );
    res.status(200).json(trendData);
  }),

  getSurveysRespondedChart: asyncHandler(async (req, res) => {
    const { startDate, endDate, period } = req.query;
    const chartData = await dashboardRepository.getSurveysRespondedChart(
      req.tenantId,
      startDate,
      endDate,
      period,
    );
    res.status(200).json(chartData);
  }),
  
  getEvolutionDashboard: asyncHandler(async (req, res) => {
    const { period, startDate, endDate } = req.query;
    const evolutionData = await dashboardRepository.getEvolutionData(
      req.tenantId,
      period,
      startDate,
      endDate,
    );
    res.status(200).json(evolutionData);
  }),

  getWordCloud: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const wordCloudData = await dashboardRepository.getWordCloudData(
      req.tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(wordCloudData);
  }),

  getAttendantsPerformance: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const attendantsPerformance =
      await dashboardRepository.getAttendantsPerformance(
        req.tenantId,
        startDate,
        endDate,
      );
    res.status(200).json(attendantsPerformance);
  }),

  getDetails: asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { startDate, endDate } = req.query;
    const detailsData = await dashboardRepository.getDetails(
      req.tenantId,
      startDate,
      endDate,
      category,
    );
    res.status(200).json(detailsData);
  }),

  getAttendantDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const detailsData = await dashboardRepository.getAttendantDetails(
      req.tenantId,
      id,
      startDate,
      endDate,
    );
    res.status(200).json(detailsData);
  }),

  getResponseDetails: asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const detailsData = await dashboardRepository.getResponseDetails(
      req.tenantId,
      sessionId,
    );
    res.status(200).json(detailsData);
  }),
  
  getAllFeedbacks: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const feedbacks = await dashboardRepository.getFeedbacks(
      req.tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(feedbacks);
  }),

  getDailyReport: asyncHandler(async (req, res) => {
    const { date, startDate: queryStartDate, endDate: queryEndDate, surveyId } = req.query;
    const { startDate, endDate } = getPeriodDateRange(queryStartDate, queryEndDate, 'day', date);
    const reportData = await dashboardRepository.getDashboardData(
      req.tenantId,
      startDate,
      endDate,
      'day',
      surveyId
    );
    res.status(200).json(reportData);
  }),

  getWeeklyReport: asyncHandler(async (req, res) => {
    const { date, startDate: queryStartDate, endDate: queryEndDate, surveyId } = req.query;
    const { startDate, endDate } = getPeriodDateRange(queryStartDate, queryEndDate, 'week', date);
    const reportData = await dashboardRepository.getDashboardData(
      req.tenantId,
      startDate,
      endDate,
      'week',
      surveyId
    );
    res.status(200).json(reportData);
  }),

  getMonthlyReport: asyncHandler(async (req, res) => {
    const { date, startDate: queryStartDate, endDate: queryEndDate, surveyId } = req.query;
    const { startDate, endDate } = getPeriodDateRange(queryStartDate, queryEndDate, 'month', date);
    const reportData = await dashboardRepository.getDashboardData(
      req.tenantId,
      startDate,
      endDate,
      'month',
      surveyId
    );
    res.status(200).json(reportData);
  }),
};

