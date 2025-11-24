const express = require("express");
const router = express.Router();
const automationController = require("../controllers/automationController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Aqui ficarão as rotas de teste para as automações
router.post(
  "/test/daily-report",
  protect,
  authorize(["admin", "superadmin"]),
  automationController.testDailyReport,
);

router.post(
  "/test/birthday",
  protect,
  authorize(["admin", "superadmin"]),
  automationController.testBirthday,
);

router.post(
  "/test/coupon-reminder",
  protect,
  authorize(["admin", "superadmin"]),
  automationController.testCouponReminder,
);

router.post(
  "/test/roleta-prize",
  protect,
  authorize(["admin", "superadmin"]),
  automationController.testRoletaPrize,
);


module.exports = router;