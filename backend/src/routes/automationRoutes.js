const express = require("express");
const router = express.Router();
const automationController = require("../controllers/automationController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");

// Aqui ficarão as rotas de teste para as automações
router.post(
  "/test/daily-report",
  authMiddleware,
  authorize(["admin", "superadmin"]),
  automationController.testDailyReport,
);

router.post(
  "/test/birthday",
  authMiddleware,
  authorize(["admin", "superadmin"]),
  automationController.testBirthday,
);

router.post(
  "/test/coupon-reminder",
  authMiddleware,
  authorize(["admin", "superadmin"]),
  automationController.testCouponReminder,
);

router.post(
  "/test/roleta-prize",
  authMiddleware,
  authorize(["admin", "superadmin"]),
  automationController.testRoletaPrize,
);


module.exports = router;