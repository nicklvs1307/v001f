const express = require('express');
const router = express.Router();
const { check } = require("express-validator");
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validationMiddleware");

// Todas as rotas do dashboard exigem autenticação
router.use(protect);

router.get(
  '/summary',
  [
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getSummary
);
router.get(
  '/response-chart',
  [
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getResponseChart
);
router.get(
  '/ranking-attendants',
  [
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getRanking
);
router.get(
  '/nps-criteria',
  [
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getCriteriaScores
);
router.get(
  '/recent-feedbacks',
  [
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getFeedbacks
);
router.get(
  '/conversion-chart',
  [
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getConversionChart
);
router.get(
  '/overall-results',
  [
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getOverallResults
); // Nova rota para resultados gerais

router.get(
  '/nps-trend',
  [
    check("period", "Período inválido. Use 'day', 'week' ou 'month'.").optional().isIn(['day', 'week', 'month']),
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getNpsTrend
);

router.get(
    '/evolution',
    [
        check("period", "Período inválido. Use 'day', 'week' ou 'month'.").optional().isIn(['day', 'week', 'month']),
        check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
        check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    ],
    validate,
    authorize('dashboard:read'),
    dashboardController.getEvolutionDashboard
);

router.get(
    '/wordcloud',
    [
        check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
        check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
        check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
    ],
    validate,
    authorize('dashboard:read'),
    dashboardController.getWordCloud
);

router.get(
  '/attendants-performance',
  [
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getAttendantsPerformance
);

router.get(
  '/main',
  [
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getMainDashboard
);

router.get(
    '/details/:category',
    [
        check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
        check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
        check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
    ],
    validate,
    authorize('dashboard:read'),
    dashboardController.getDetails
);

router.get(
    '/attendant/:id',
    [
        check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
        check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
        check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
    ],
    validate,
    authorize('dashboard:read'),
    dashboardController.getAttendantDetails
);

router.get(
    '/response/:sessionId',
    [
        check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
    ],
    validate,
    authorize('dashboard:read'),
    dashboardController.getResponseDetails
);

router.get(
  '/month-summary',
  [
    check("startDate", "Data de início inválida").optional().isISO8601().toDate(),
    check("endDate", "Data de fim inválida").optional().isISO8601().toDate(),
    check("surveyId", "ID da pesquisa inválido").optional().isUUID(),
  ],
  validate,
  authorize('dashboard:read'),
  dashboardController.getMonthSummary
);

module.exports = router;
