const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes in this file are protected
router.use(protect);

router.post('/generate-variations', aiController.generateVariations);

module.exports = router;
