const asyncHandler = require("express-async-handler");
const dashboardService = require("../services/dashboardService");
const dashboardRepository = require("../repositories/dashboardRepository"); // Mantido por enquanto para as outras funções
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
      surveyId,
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
    const ranking = await dashboardService.getRanking(
      req.tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(ranking);
  }),

  getCriteriaScores: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const criteriaScores = await dashboardRepository.getScoresByCriteria(
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
      await dashboardService.getAttendantsPerformance(
        req.tenantId,
        startDate,
        endDate,
      );
    res.status(200).json(attendantsPerformance);
  }),

  getAttendantResponsesTimeseries: asyncHandler(async (req, res) => {
    const { period, startDate, endDate, atendenteId } = req.query;
    const data = await dashboardService.getAttendantResponsesTimeseries(
      req.tenantId,
      period || "day",
      startDate,
      endDate,
      atendenteId,
    );
    res.status(200).json(data);
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
    const { startDate, endDate, npsClassification, page, limit } = req.query;
    const feedbacks = await dashboardRepository.getFeedbacks(
      req.tenantId,
      startDate,
      endDate,
      npsClassification,
      page,
      limit,
    );
    res.status(200).json(feedbacks);
  }),

  getReport: asyncHandler(async (req, res) => {
    const { reportType } = req.params;
    const {
      date,
      startDate: queryStartDate,
      endDate: queryEndDate,
      surveyId,
    } = req.query;

    const validReportTypes = {
      diario: "day",
      semanal: "week",
      mensal: "month",
    };

    const period = validReportTypes[reportType];

    if (!period) {
      return res.status(400).json({ message: "Tipo de relatório inválido." });
    }

    const { startDate, endDate } = getPeriodDateRange(
      queryStartDate,
      queryEndDate,
      period,
      date,
    );

    const reportData = await dashboardRepository.getDashboardData(
      req.tenantId,
      startDate,
      endDate,
      period,
      surveyId,
    );

    const surveySummaries = await dashboardRepository.getSummaryBySurvey(
      req.tenantId,
      startDate,
      endDate,
    );

    res.status(200).json({ ...reportData, surveySummaries });
  }),

  getDemographicsData: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await dashboardRepository.getDemographicsData(
      req.tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(data);
  }),

  getTopClientsByResponses: asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const data = await dashboardRepository.getTopClientsByResponses(
      req.tenantId,
      limit,
    );
    res.status(200).json(data);
  }),

  getTopClientsByRedemptions: asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const data = await dashboardRepository.getTopClientsByRedemptions(
      req.tenantId,
      limit,
    );
    res.status(200).json(data);
  }),
};
