const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const superadminController = require("../controllers/superadminController");

router.post(
  "/login-as-tenant/:tenantId",
  protect,
  authorize("Super Admin"),
  superadminController.loginAsTenant,
);

module.exports = router;
