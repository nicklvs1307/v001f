const express = require("express");
const router = express.Router();
const senderController = require("../../controllers/superadmin/senderController");
const { protect, authorize } = require("../../middlewares/authMiddleware");
const apiKeyAuth = require("../../middlewares/apiKeyAuth");

// Webhook route - does not need user authentication, but requires an API key
router.post("/webhook", apiKeyAuth, senderController.handleWebhook);

// Protect all other routes in this file and ensure only Super Admin can access them
router.use(protect, authorize()); // authorize() without args defaults to Super Admin check

router.get("/", senderController.getAll);
router.post("/", senderController.create);
router.get("/:id", senderController.getById);
router.put("/:id", senderController.update);
router.delete("/:id", senderController.delete);

// Routes for instance connection
router.get("/:id/connect", senderController.getQrCode);
router.put("/:id/restart", senderController.restartInstance);
router.delete("/:id/logout", senderController.logoutInstance);

module.exports = router;
