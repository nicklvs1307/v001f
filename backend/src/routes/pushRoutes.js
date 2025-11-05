const express = require('express');
const router = express.Router();
const pushController = require('../controllers/pushController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/subscribe', protect, pushController.subscribe);

module.exports = router;
