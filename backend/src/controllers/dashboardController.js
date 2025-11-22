const asyncHandler = require("express-async-handler");
const dashboardRepository = require("../repositories/dashboardRepository");

const dashboardController = {
  // Rota principal que agrega a maioria dos dados
  getMainDashboard: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? req.query.tenantId : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const dashboardData = await dashboardRepository.getMainDashboard(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(dashboardData);
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

  // Mapeada para a nova função getSummary
  getMonthSummary: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const summary = await dashboardRepository.getSummary(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(summary);
  }),

  // Mapeada para a nova função getNpsTrendData
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
  
  // Mapeada para a nova função getFeedbacks
  getAllFeedbacks: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    // A nova função getFeedbacks retorna um número limitado de feedbacks.
    // Se for necessário retornar TODOS, a função no repositório precisa ser ajustada.
    const feedbacks = await dashboardRepository.getFeedbacks(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(feedbacks);
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

  // O restante das rotas permanece, pois correspondem a funções que ainda existem no novo repositório
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
    const { startDate, endDate } = req.query;
    const chartData = await dashboardRepository.getResponseChart(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(chartData);
  }),

  getNpsByCriteria: asyncHandler(async (req, res) => {
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
  
  getNpsDistribution: asyncHandler(async (req, res) => {
    const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
    const { startDate, endDate } = req.query;
    const distribution = await dashboardRepository.getNpsDistribution(
      tenantId,
      startDate,
      endDate,
    );
    res.status(200).json(distribution);
  }),
};

module.exports = dashboardController;
