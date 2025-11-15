const asyncHandler = require('express-async-handler');
const dashboardRepository = require('../repositories/dashboardRepository');
const { fromZonedTime } = require('date-fns-tz');

const timeZone = 'America/Sao_Paulo';

// Helper to adjust date ranges to the tenant's timezone
const adjustDateRange = (startDateStr, endDateStr) => {
    let startDate = null;
    let endDate = null;

    if (startDateStr) {
        const parsedStart = fromZonedTime(`${startDateStr}T00:00:00`, timeZone);
        if (parsedStart && !isNaN(parsedStart.getTime())) {
            startDate = parsedStart;
        }
    }

    if (endDateStr) {
        const parsedEnd = fromZonedTime(`${endDateStr}T23:59:59.999`, timeZone);
        if (parsedEnd && !isNaN(parsedEnd.getTime())) {
            endDate = parsedEnd;
        }
    }

    return { startDate, endDate };
};


const dashboardController = {
    getSummary: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const summary = await dashboardRepository.getSummary(tenantId, startDate, endDate, req.query.surveyId);
        res.status(200).json(summary);
    }),

    getResponseChart: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const chartData = await dashboardRepository.getResponseChart(tenantId, startDate, endDate, req.query.surveyId);
        res.status(200).json(chartData);
    }),

    getRanking: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const ranking = await dashboardRepository.getRanking(tenantId, startDate, endDate, req.query.surveyId);
        res.status(200).json(ranking);
    }),

    getCriteriaScores: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const criteriaScores = await dashboardRepository.getCriteriaScores(tenantId, startDate, endDate, req.query.surveyId);
        res.status(200).json(criteriaScores);
    }),

    getFeedbacks: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const feedbacks = await dashboardRepository.getFeedbacks(tenantId, startDate, endDate, req.query.surveyId);
        res.status(200).json(feedbacks);
    }),

    getConversionChart: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const chartData = await dashboardRepository.getConversionChart(tenantId, startDate, endDate, req.query.surveyId);
        res.status(200).json(chartData);
    }),

    getOverallResults: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const results = await dashboardRepository.getOverallResults(tenantId, startDate, endDate, req.query.surveyId);
        res.status(200).json(results);
    }),

    getNpsTrend: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { period, surveyId } = req.query;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const trendData = await dashboardRepository.getNpsTrendData(tenantId, period, startDate, endDate, surveyId);
        res.status(200).json(trendData);
    }),

    getEvolutionDashboard: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { period } = req.query;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const evolutionData = await dashboardRepository.getEvolutionDashboard(tenantId, period, startDate, endDate);
        res.status(200).json(evolutionData);
    }),

    getNpsByDayOfWeek: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { surveyId } = req.query;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const npsByDayOfWeek = await dashboardRepository.getNpsByDayOfWeek(tenantId, startDate, endDate, surveyId);
        res.status(200).json(npsByDayOfWeek);
    }),

    getWordCloud: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { surveyId } = req.query;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const wordCloudData = await dashboardRepository.getWordCloudData(tenantId, startDate, endDate, surveyId);
        res.status(200).json(wordCloudData);
    }),
    getAttendantsPerformance: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { surveyId } = req.query;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const attendantsPerformance = await dashboardRepository.getAttendantsPerformanceWithGoals(tenantId, startDate, endDate, surveyId);
        res.status(200).json(attendantsPerformance);
    }),

    getMainDashboard: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { surveyId } = req.query;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const dashboardData = await dashboardRepository.getMainDashboard(tenantId, startDate, endDate, surveyId);
        res.status(200).json(dashboardData);
    }),

    getDetails: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { category } = req.params;
        const { surveyId } = req.query;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const details = await dashboardRepository.getDetailsByCategory(tenantId, category, startDate, endDate, surveyId);
        res.status(200).json(details);
    }),

    getAttendantDetails: asyncHandler(async (req, res) => {
        const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
        const { id } = req.params;
        const { surveyId } = req.query;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
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
        const { surveyId } = req.query;
        const { startDate, endDate } = adjustDateRange(req.query.startDate, req.query.endDate);
        const summary = await dashboardRepository.getMonthSummary(tenantId, startDate, endDate, surveyId);
        res.status(200).json(summary);
    }),
};

module.exports = dashboardController;