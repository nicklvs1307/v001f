const express = require('express');
const AiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();
const aiController = new AiController();

// All routes in this file are protected
router.use(protect);

router.post('/generate-variations', aiController.generateVariations);

module.exports = router;
