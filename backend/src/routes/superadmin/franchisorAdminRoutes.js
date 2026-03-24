const express = require("express");
const router = express.Router();
const franchisorAdminController = require("../../controllers/superadmin/franchisorAdminController");
const { protect, authorize } = require("../../middlewares/authMiddleware");

// Super Admins e Franqueadores podem acessar estas rotas
// (A lógica de filtragem por franchisorId deve ser aplicada nos repositórios/controllers)
router.use(protect, authorize(["Super Admin", "Franqueador"]));

router.post("/", franchisorAdminController.createFranchisor);
router.get("/", franchisorAdminController.getAllFranchisors);
router.get("/:id", franchisorAdminController.getFranchisorById);
router.put("/:id", franchisorAdminController.updateFranchisor);
router.delete("/:id", franchisorAdminController.deleteFranchisor);

module.exports = router;
