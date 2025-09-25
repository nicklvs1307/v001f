const asyncHandler = require('express-async-handler');
const dashboardRepository = require('../repositories/dashboardRepository');

const dashboardController = {
    getSummary: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = req.query;
        const summary = await dashboardRepository.getSummary(tenantId, startDate, endDate);
        res.status(200).json(summary);
    }),

    getResponseChart: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = req.query;
        const chartData = await dashboardRepository.getResponseChart(tenantId, startDate, endDate);
        res.status(200).json(chartData);
    }),

    getRanking: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = req.query;
        const ranking = await dashboardRepository.getRanking(tenantId, startDate, endDate);
        res.status(200).json(ranking);
    }),

    getNPSCritera: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = req.query;
        const npsCriteria = await dashboardRepository.getNPSCritera(tenantId, startDate, endDate);
        res.status(200).json(npsCriteria);
    }),

    getFeedbacks: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = req.query;
        const feedbacks = await dashboardRepository.getFeedbacks(tenantId, startDate, endDate);
        res.status(200).json(feedbacks);
    }),

    getConversionChart: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = req.query;
        const chartData = await dashboardRepository.getConversionChart(tenantId, startDate, endDate);
        res.status(200).json(chartData);
    }),

    getOverallResults: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = req.query;
        const results = await dashboardRepository.getOverallResults(tenantId, startDate, endDate);
        res.status(200).json(results);
    }),

    getNpsTrend: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { period } = req.query; // 'day', 'week', 'month'
        const trendData = await dashboardRepository.getNpsTrendData(tenantId, period);
        res.status(200).json(trendData);
    }),

    getWordCloud: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const wordCloudData = await dashboardRepository.getWordCloudData(tenantId);
        res.status(200).json(wordCloudData);
    }),
    getAttendantsPerformance: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const attendantsPerformance = await dashboardRepository.getAttendantsPerformanceWithGoals(tenantId);
        res.status(200).json(attendantsPerformance);
    }),
};

module.exports = dashboardController;
