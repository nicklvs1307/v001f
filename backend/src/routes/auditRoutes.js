const express = require("express");
const router = express.Router();
const surveyAuditController = require("../controllers/surveyAuditController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.use(protect);
router.use(authorize(["Admin"]));

router.get("/surveys", surveyAuditController.getSurveyParticipations);
router.get("/surveys/:sessionId", surveyAuditController.getParticipationDetails);
router.post("/surveys/:sessionId/cancel", surveyAuditController.cancelParticipation);

module.exports = router;
