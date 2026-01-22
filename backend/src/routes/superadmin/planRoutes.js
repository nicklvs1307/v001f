const express = require("express");
const router = express.Router();
const planController = require("../../controllers/superadmin/planController");
const { protect, authorize } = require("../../middlewares/authMiddleware");

router.use(protect);
router.use(authorize("Super Admin")); // Apenas Super Admin mexe aqui

router
  .route("/")
  .get(planController.getAllPlans)
  .post(planController.createPlan);

router
  .route("/:id")
  .put(planController.updatePlan)
  .delete(planController.deletePlan);

module.exports = router;
