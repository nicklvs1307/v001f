const express = require("express");
const router = express.Router();
const whatsappConfigController = require("../controllers/whatsappConfigController");

// Rota para receber os webhooks da Evolution API
router.post("/webhook", whatsappConfigController.handleWebhook);

module.exports = router;
