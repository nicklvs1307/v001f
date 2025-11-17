"use strict";
const express = require("express");
const router = express.Router();
const roletaAdminController = require("../controllers/roletaAdminController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.use(protect);

router
  .route("/")
  .post(authorize("roletas:create"), roletaAdminController.createRoleta)
  .get(authorize("roletas:read"), roletaAdminController.getAllRoletas);

router
  .route("/:id")
  .get(authorize("roletas:read"), roletaAdminController.getRoletaById)
  .put(authorize("roletas:update"), roletaAdminController.updateRoleta)
  .delete(authorize("roletas:delete"), roletaAdminController.deleteRoleta);

module.exports = router;
