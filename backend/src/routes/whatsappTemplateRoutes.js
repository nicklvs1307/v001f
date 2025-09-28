const express = require('express');
const router = express.Router();
const WhatsappTemplateController = require('../controllers/whatsappTemplateController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteger todas as rotas de template com autenticação
router.use(authMiddleware);

router.get('/', WhatsappTemplateController.get);
router.post('/', WhatsappTemplateController.upsert);

module.exports = router;
