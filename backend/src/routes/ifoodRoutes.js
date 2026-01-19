const ifoodService = require('../services/ifoodService');
const express = require('express');
const asyncHandler = require('express-async-handler');
const ApiError = require('../errors/ApiError');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Endpoint para iniciar o fluxo de autenticação e gerar o user_code
router.get('/authorize', protect, asyncHandler(async (req, res) => {
    const tenantId = req.user.tenant.id;

    if (!tenantId) {
        throw new ApiError(400, 'Tenant ID is required to initiate iFood authorization.');
    }
    
    // Chama o serviço para gerar o user code junto ao iFood
    const userCodeData = await ifoodService.generateUserCode(tenantId);
    
    // Retorna os dados para o frontend, que irá exibir para o usuário
    res.json(userCodeData);
}));

// 2. Endpoint para trocar o authorizationCode (recebido pelo usuário no portal iFood) pelo access_token
router.post('/exchange-code', protect, asyncHandler(async (req, res) => {
    const tenantId = req.user.tenant.id;
    const { authorizationCode } = req.body;

    if (!tenantId) {
        throw new ApiError(400, 'Tenant ID is required.');
    }

    if (!authorizationCode) {
        throw new ApiError(400, 'iFood Authorization Code is required.');
    }

    // O service agora usa grantType: 'authorization_code' e o código recebido
    await ifoodService.requestNewAccessToken(tenantId, authorizationCode);

    res.status(200).json({ message: 'iFood connected successfully!' });
}));


module.exports = router;
