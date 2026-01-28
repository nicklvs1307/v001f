const express = require("express");
const router = express.Router();
const deliveryIntegrationController = require("../controllers/deliveryIntegrationController");
const validateUaiRangoWebhook = require("../middlewares/uairangoValidation");

router.post(
  "/uairango",
  validateUaiRangoWebhook,
  deliveryIntegrationController.handleUaiRangoWebhook,
);

module.exports = router;
