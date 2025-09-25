const express = require('express');
const router = express.Router();
const gmbAuthController = require('../controllers/gmbAuthController');
const { protect } = require('../middlewares/authMiddleware');

// Rota para iniciar o processo de autenticação e redirecionar para o Google (Pública)
router.get('/', gmbAuthController.redirectToGoogle);

// Rota de callback que o Google chama após o usuário dar consentimento (Protegida)
router.get('/callback', protect, gmbAuthController.handleGoogleCallback);

module.exports = router;
