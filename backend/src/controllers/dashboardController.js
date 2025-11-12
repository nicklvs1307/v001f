const asyncHandler = require('express-async-handler');
const dashboardRepository = require('../repositories/dashboardRepository');

const dashboardController = {
    getSummary: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const summary = await dashboardRepository.getSummary(tenantId, startDate, endDate, surveyId);
        res.status(200).json(summary);
    }),

    getResponseChart: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const chartData = await dashboardRepository.getResponseChart(tenantId, startDate, endDate, surveyId);
        res.status(200).json(chartData);
    }),

    getRanking: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const ranking = await dashboardRepository.getRanking(tenantId, startDate, endDate, surveyId);
        res.status(200).json(ranking);
    }),

    getCriteriaScores: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const criteriaScores = await dashboardRepository.getCriteriaScores(tenantId, startDate, endDate, surveyId);
        res.status(200).json(criteriaScores);
    }),

    getFeedbacks: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const feedbacks = await dashboardRepository.getFeedbacks(tenantId, startDate, endDate, surveyId);
        res.status(200).json(feedbacks);
    }),

    getConversionChart: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const chartData = await dashboardRepository.getConversionChart(tenantId, startDate, endDate, surveyId);
        res.status(200).json(chartData);
    }),

    getOverallResults: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const results = await dashboardRepository.getOverallResults(tenantId, startDate, endDate, surveyId);
        res.status(200).json(results);
    }),

    getNpsTrend: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { period, startDate, endDate, surveyId } = req.query; // 'day', 'week', 'month'
        const trendData = await dashboardRepository.getNpsTrendData(tenantId, period, startDate, endDate, surveyId);
        res.status(200).json(trendData);
    }),

    getEvolutionDashboard: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { period, startDate, endDate } = req.query;
        const evolutionData = await dashboardRepository.getEvolutionDashboard(tenantId, period, startDate, endDate);
        res.status(200).json(evolutionData);
    }),

    getNpsByDayOfWeek: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const npsByDayOfWeek = await dashboardRepository.getNpsByDayOfWeek(tenantId, startDate, endDate, surveyId);
        res.status(200).json(npsByDayOfWeek);
    }),

    getWordCloud: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const wordCloudData = await dashboardRepository.getWordCloudData(tenantId, startDate, endDate, surveyId);
        res.status(200).json(wordCloudData);
    }),
    getAttendantsPerformance: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const attendantsPerformance = await dashboardRepository.getAttendantsPerformanceWithGoals(tenantId, startDate, endDate, surveyId);
        res.status(200).json(attendantsPerformance);
    }),

    getMainDashboard: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const dashboardData = await dashboardRepository.getMainDashboard(tenantId, startDate, endDate, surveyId);
        res.status(200).json(dashboardData);
    }),

    getDetails: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { category } = req.params;
        const { startDate, endDate, surveyId } = req.query;
        const details = await dashboardRepository.getDetailsByCategory(tenantId, category, startDate, endDate, surveyId);
        res.status(200).json(details);
    }),

    getAttendantDetails: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { id } = req.params;
        const { startDate, endDate, surveyId } = req.query;
        const details = await dashboardRepository.getAttendantDetailsById(tenantId, id, startDate, endDate, surveyId);
        res.status(200).json(details);
    }),

    getResponseDetails: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { sessionId } = req.params;
        const { surveyId } = req.query;
        const details = await dashboardRepository.getResponseDetailsBySessionId(tenantId, sessionId, surveyId);
        res.status(200).json(details);
    }),

    getMonthSummary: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate, surveyId } = req.query;
        const summary = await dashboardRepository.getMonthSummary(tenantId, startDate, endDate, surveyId);
        res.status(200).json(summary);
    }),
};

module.exports = dashboardController;
