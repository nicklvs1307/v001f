const ApiError = require('../errors/ApiError');
const tenantRepository = require('../repositories/tenantRepository'); // Importar o tenantRepository
const { protect } = require('../middlewares/authMiddleware'); // Importar o middleware de proteção
// Você deve importar o seu middleware de autenticação real aqui
// Exemplo: const { authenticateUser } = require('../middlewares/authMiddleware');
// Exemplo: const { getTenantIdFromUser } = require('../utils/authUtils'); // Se for uma função auxiliar

const router = express.Router();

// A IFOOD_REDIRECT_URI é global porque o iFood geralmente só permite um URI de redirecionamento por aplicação no painel do desenvolvedor.
const IFOOD_REDIRECT_URI = process.env.IFOOD_REDIRECT_URI;
const IFOOD_AUTH_BASE_URL = process.env.IFOOD_AUTH_BASE_URL || 'https://sandbox.ifood.com.br/oauth/v2/auth'; // Sandbox auth URL




// 1. Endpoint para iniciar o fluxo OAuth (frontend chama este)
router.get('/authorize', protect, asyncHandler(async (req, res) => {
    const tenantId = req.user.tenant.id; // Obtenha o tenantId do usuário autenticado através do objeto tenant aninhado

    const ifoodMerchantId = req.query.merchantId; // O frontend pode passar o merchantId se já tiver

    if (!tenantId) {
        throw new ApiError(400, 'Tenant ID is required to initiate iFood authorization.');
    }
    if (!IFOOD_REDIRECT_URI) {
        throw new ApiError(500, 'IFOOD_REDIRECT_URI not configured in environment variables.');
    }

    const tenant = await tenantRepository.getTenantById(tenantId);
    if (!tenant) {
        throw new ApiError(404, 'Tenant not found.');
    }
    if (!tenant.ifoodClientId) {
        throw new ApiError(400, 'iFood Client ID not configured for this tenant. Please configure it first.');
    }

    // Usar um 'state' para segurança e para passar contexto como tenantId
    const state = Buffer.from(JSON.stringify({ tenantId, ifoodMerchantId })).toString('base64');

    const authorizationUrl = `${IFOOD_AUTH_BASE_URL}?` +
                             `response_type=code&` +
                             `client_id=${tenant.ifoodClientId}&` + // Usar o Client ID do tenant
                             `access_type=offline&` + // Para obter refresh_token
                             `scope=merchant:read orders:read events:read&` + // Escopos necessários
                             `redirect_uri=${IFOOD_REDIRECT_URI}&` +
                             `state=${state}`;

    res.json({ authorizationUrl });
}));

// 2. Endpoint de callback para o iFood (iFood redireciona para este)
router.get('/oauth/callback', asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        console.error('iFood OAuth Callback Error:', error);
        // Redirecionar para o frontend com mensagem de erro
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integracoes?ifood_auth_error=${error}`);
    }

    if (!code) {
        // Redirecionar para o frontend com mensagem de erro
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integracoes?ifood_auth_error=no_code_received`);
    }

    let tenantIdFromState = null;
    let ifoodMerchantIdFromState = null;
    try {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        tenantIdFromState = decodedState.tenantId;
        ifoodMerchantIdFromState = decodedState.ifoodMerchantId;
    } catch (e) {
        console.error('Error decoding state parameter:', e);
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integracoes?ifood_auth_error=invalid_state`);
    }

    if (!tenantIdFromState) {
        console.error('Tenant ID not found in state parameter for iFood OAuth callback.');
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integracoes?ifood_auth_error=missing_tenant_id`);
    }

    try {
        // ifoodService.requestNewAccessToken já busca as credenciais do tenant por tenantId
        await ifoodService.requestNewAccessToken(tenantIdFromState, code);

        // Se o ifoodMerchantId foi passado e não está salvo, salvar
        if (ifoodMerchantIdFromState) {
            const tenant = await tenantRepository.getTenantById(tenantIdFromState);
            if (tenant && !tenant.ifoodMerchantId) {
                await tenantRepository.updateTenant(tenantIdFromState, { ifoodMerchantId: ifoodMerchantIdFromState });
            }
        }
        
        // Redirecionar para o frontend com mensagem de sucesso
        res.redirect(`${process.env.FRONTEND_URL}/dashboard/integracoes?ifood_auth_success=true`);

    } catch (err) {
        console.error('Error during iFood OAuth token exchange or saving:', err);
        res.redirect(`${process.env.FRONTEND_URL}/dashboard/integracoes?ifood_auth_error=token_exchange_failed`);
    }
}));

module.exports = router;
