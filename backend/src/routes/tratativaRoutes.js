const express = require("express");
const router = express.Router();
const tratativaController = require("../controllers/tratativaController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.put("/:sessionId", tratativaController.upsertTratativa);

module.exports = router;
