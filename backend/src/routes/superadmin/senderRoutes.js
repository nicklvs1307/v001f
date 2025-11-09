const express = require('express');
const router = express.Router();
const senderController = require('../../controllers/superadmin/senderController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

// Protect all routes in this file and ensure only Super Admin can access them
router.use(protect, authorize()); // authorize() without args defaults to Super Admin check

router.get('/', senderController.getAll);
router.post('/', senderController.create);
router.get('/:id', senderController.getById);
router.put('/:id', senderController.update);
router.delete('/:id', senderController.delete);

// Routes for instance connection
router.get('/:id/status', senderController.getInstanceStatus);
router.get('/:id/connect', senderController.getQrCode);

module.exports = router;
