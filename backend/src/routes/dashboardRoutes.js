const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const dashboardController = require("../controllers/dashboardController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const {
  validateDateFilters,
  validatePeriodFilter,
} = require("../middlewares/dashboardValidationMiddleware");

const tenantMiddleware = require("../middlewares/tenantMiddleware");

// Todas as rotas do dashboard exigem autenticação
router.use(protect);
router.use(tenantMiddleware);

router.get(
  "/summary",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getSummary,
);
router.get(
  "/response-chart",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getResponseChart,
);
router.get(
  "/ranking-attendants",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getRanking,
);
router.get(
  "/nps-criteria",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getCriteriaScores,
);
router.get(
  "/recent-feedbacks",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getFeedbacks,
);
router.get(
  "/conversion-chart",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getConversionChart,
);

router.get(
  "/nps-trend",
  validatePeriodFilter,
  validate,
  authorize("dashboard:read"),
  dashboardController.getNpsTrend,
);

router.get(
  "/surveys-responded-chart",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getSurveysRespondedChart,
);

router.get(
  "/evolution",
  validatePeriodFilter,
  validate,
  authorize("dashboard:read"),
  dashboardController.getEvolutionDashboard,
);

router.get(
  "/wordcloud",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getWordCloud,
);

router.get(
  "/attendants-performance",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getAttendantsPerformance,
);

router.get(
  "/main",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getMainDashboard,
);

router.get(
  "/details/:category",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getDetails,
);

router.get(
  "/attendant/:id",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getAttendantDetails,
);

router.get(
  "/response/:sessionId",
  [check("surveyId", "ID da pesquisa inválido").optional().isUUID()],
  validate,
  authorize("dashboard:read"),
  dashboardController.getResponseDetails,
);

router.get(
  "/month-summary",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getMonthSummary,
);

router.get(
  "/all-feedbacks",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getAllFeedbacks,
);

router.get(
  "/daily-report",
  validateDateFilters,
  validate,
  authorize("dashboard:read"),
  dashboardController.getDailyReport,
);

module.exports = router;
