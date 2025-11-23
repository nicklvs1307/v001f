const asyncHandler = require("express-async-handler");
const dashboardRepository = require("../repositories/dashboardRepository");

// Objeto que mapeia as rotas para as funções do repositório
const dashboardController = {
  getMainDashboard: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? req.query.tenantId : req.user.tenantId;
    const { startDate, endDate, period } = req.query;
    const dashboardData = await dashboardRepository.getMainDashboard(
      tenantId,
      startDate,
      endDate,
      period,
    );
    res.status(200).json(dashboardData);
  }),

  getSummary: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const summary = await dashboardRepository.getSummary(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(summary);
  }),

  getResponseChart: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate, period } = req.query;
    const chartData = await dashboardRepository.getResponseChart(
      tenantId,
      startDate,
      endDate,
      period,
    );
    res.status(200).json(chartData);
  }),

  // FIX: Função de ranking não existe no novo repositório
  getRanking: asyncHandler(async (req, res) => {
    res.status(200).json([]);
  }),

  getCriteriaScores: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const criteriaScores = await dashboardRepository.getNpsByCriteria(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(criteriaScores);
  }),

  getFeedbacks: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const feedbacks = await dashboardRepository.getFeedbacks(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(feedbacks);
  }),

  getConversionChart: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const chartData = await dashboardRepository.getConversionChartData(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(chartData);
  }),

  // FIX: Função de resultados gerais não existe como uma chamada única
  getOverallResults: asyncHandler(async (req, res) => {
    res.status(200).json({});
  }),

  getNpsTrend: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { period, startDate, endDate } = req.query;
    const trendData = await dashboardRepository.getNpsTrendData(
      tenantId,
      period,
      startDate,
      endDate,
    );
    res.status(200).json(trendData);
  }),
  
  getEvolutionDashboard: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { period, startDate, endDate } = req.query;
    const evolutionData = await dashboardRepository.getNpsTrendData(
      tenantId,
      period,
      startDate,
      endDate,
    );
    res.status(200).json(evolutionData);
  }),

  getWordCloud: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const wordCloudData = await dashboardRepository.getWordCloudData(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(wordCloudData);
  }),

  getAttendantsPerformance: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const attendantsPerformance =
      await dashboardRepository.getAttendantsPerformance(
        tenantId,
        startDate,
        endDate,
      );
    res.status(200).json(attendantsPerformance);
  }),

  getDetails: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? req.query.tenantId : req.user.tenantId;
    const { category } = req.params;
    const { startDate, endDate } = req.query;
    const detailsData = await dashboardRepository.getDetails(
      tenantId,
      startDate,
      endDate,
      category,
    );
    res.status(200).json(detailsData);
  }),

  getAttendantDetails: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? req.query.tenantId : req.user.tenantId;
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const detailsData = await dashboardRepository.getAttendantDetails(
      tenantId,
      id,
      startDate,
      endDate,
    );
    res.status(200).json(detailsData);
  }),

  getResponseDetails: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? req.query.tenantId : req.user.tenantId;
    const { sessionId } = req.params;
    const detailsData = await dashboardRepository.getResponseDetails(
      tenantId,
      sessionId,
    );
    res.status(200).json(detailsData);
  }),
  
  getMonthSummary: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const summary = await dashboardRepository.getMonthSummary(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(summary);
  }),
  
  getAllFeedbacks: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const feedbacks = await dashboardRepository.getFeedbacks(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(feedbacks);
  }),
};

module.exports = dashboardController;
