const ifoodService = require('../services/ifoodService');
const express = require('express');
const asyncHandler = require('express-async-handler');
const ApiError = require('../errors/ApiError');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Endpoint para obter a URL de autorização do iFood (Browser Flow)
router.get('/authorize', protect, asyncHandler(async (req, res) => {
    const tenantId = req.user.tenant.id;

    if (!tenantId) {
        throw new ApiError(400, 'Tenant ID is required to initiate iFood authorization.');
    }
    
    // Retorna a URL para o frontend redirecionar o usuário
    const urlData = await ifoodService.getAuthorizationUrl(tenantId);
    
    res.json(urlData);
}));

// 2. Callback endpoint que recebe o redirect do iFood
// GET /api/ifood/callback?code=...&state=...
router.get('/callback', asyncHandler(async (req, res) => {
    const { code, state, error, error_description } = req.query; // state é o tenantId

    const frontendUrl = process.env.FRONTEND_URL || 'https://voltaki.towersfy.com';

    if (error) {
        console.error('iFood Callback Error:', error, error_description);
        return res.redirect(`${frontendUrl}/dashboard/integracoes?ifood_error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code || !state) {
        return res.redirect(`${frontendUrl}/dashboard/integracoes?ifood_error=Missing+code+or+state`);
    }

    try {
        // Troca o code pelo token
        await ifoodService.requestNewAccessToken(state, code);
        
        // Redireciona para o frontend com sucesso
        res.redirect(`${frontendUrl}/dashboard/integracoes?ifood_success=true`);
    } catch (err) {
        console.error('iFood Callback Exchange Error:', err);
        const message = err.message || 'Falha ao conectar com o iFood.';
        res.redirect(`${frontendUrl}/dashboard/integracoes?ifood_error=${encodeURIComponent(message)}`);
    }
}));

// 3. (Opcional) Endpoint para troca manual, caso o frontend receba o code por outra via
router.post('/exchange-code', protect, asyncHandler(async (req, res) => {
    const tenantId = req.user.tenant.id;
    const { authorizationCode } = req.body;

    if (!tenantId) {
        throw new ApiError(400, 'Tenant ID is required.');
    }

    if (!authorizationCode) {
        throw new ApiError(400, 'iFood Authorization Code is required.');
    }

    await ifoodService.requestNewAccessToken(tenantId, authorizationCode);

    res.status(200).json({ message: 'iFood connected successfully!' });
}));


module.exports = router;