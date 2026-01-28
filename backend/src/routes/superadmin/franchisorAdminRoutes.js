const express = require("express");
const router = express.Router();
const franchisorAdminController = require("../../controllers/superadmin/franchisorAdminController");
const { protect, authorize } = require("../../middlewares/authMiddleware");

// Apenas Super Admins podem acessar estas rotas
router.use(protect, authorize(["Super Admin"]));

router.post("/", franchisorAdminController.createFranchisor);
router.get("/", franchisorAdminController.getAllFranchisors);
router.get("/:id", franchisorAdminController.getFranchisorById);
router.put("/:id", franchisorAdminController.updateFranchisor);
router.delete("/:id", franchisorAdminController.deleteFranchisor);

module.exports = router;
