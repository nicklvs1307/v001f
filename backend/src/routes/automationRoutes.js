const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get(
  '/',
  protect,
  authorize(['Admin']),
  automationController.getAutomations
);

router.put(
  '/',
  protect,
  authorize(['Admin']),
  automationController.updateAutomations
);

module.exports = router;
