const express = require("express");
const router = express.Router();
const permissionController = require("../../controllers/superadmin/permissionController");
const { protect, authorize } = require("../../middlewares/authMiddleware");

router.use(protect);
router.use(authorize("Super Admin"));

router.get("/permissions", permissionController.getAllPermissions);
router.get("/roles", permissionController.getAllSystemRoles);
router.put("/roles/:roleId/permissions", permissionController.updateRolePermissions);

module.exports = router;
