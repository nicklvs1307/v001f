const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/superadmin/reportController");
const { protect, authorize } = require("../../middlewares/authMiddleware");

// Protect all routes in this file and ensure only Super Admin can access them
router.use(protect, authorize()); // authorize() without args defaults to Super Admin check

router.get("/dashboard", reportController.getSuperAdminDashboard);
router.get("/system-overview", reportController.getSystemOverview);
router.get("/tenant-reports", reportController.getTenantReports);

module.exports = router;
