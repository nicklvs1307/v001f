const axios = require('axios');
const axiosRetryModule = require('axios-retry');
const axiosRetry = typeof axiosRetryModule === 'function' ? axiosRetryModule : axiosRetryModule.default;
const tenantRepository = require('../repositories/tenantRepository');
const clientRepository = require('../repositories/clientRepository');
const deliveryOrderRepository = require('../repositories/deliveryOrderRepository');
const surveyTriggerService = require('./surveyTriggerService');
const ApiError = require('../errors/ApiError');

// Configuração Axios
const ifoodAxios = axios.create({
    headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Feedeliza/1.0' 
    },
    timeout: 10000 // 10 segundos timeout
});

axiosRetry(ifoodAxios, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return axiosRetry.isNetworkError(error) ||
               axiosRetry.isRetryableError(error.response?.status) ||
               error.response?.status === 429;
    },
});

// URLs (Padrão Distribuído)
const IFOOD_AUTH_BASE_URL = 'https://merchant-api.ifood.com.br/authentication/v1.0';
const IFOOD_ORDER_BASE_URL = 'https://merchant-api.ifood.com.br/order/v1.0';
const IFOOD_EVENTS_BASE_URL = 'https://merchant-api.ifood.com.br/events/v1.0';
const IFOOD_MERCHANT_BASE_URL = 'https://merchant-api.ifood.com.br/merchant/v1.0';

// Credenciais Globais (App Distribuído)
const getGlobalCredentials = () => {
    const clientId = process.env.IFOOD_CLIENT_ID_GLOBAL;
    const clientSecret = process.env.IFOOD_CLIENT_SECRET_GLOBAL;
    
    if (!clientId || !clientSecret) {
        throw new ApiError(500, 'Configuração iFood incompleta: IFOOD_CLIENT_ID_GLOBAL ou SECRET ausente.');
    }
    return { clientId, clientSecret };
};

const ifoodService = {

    /**
     * Passo 1: Gerar URL para autorização (User Code ou Authorization Code)
     */
    async getAuthorizationUrl(tenantId) {
        const { clientId } = getGlobalCredentials();

        try {
            console.log(`[iFood Auth] Requesting User Code for tenant ${tenantId} using Client ID: ${clientId}`);
            
            // Endpoint para fluxo "User Code" (recomendado para integração fácil)
            const response = await ifoodAxios.post(`${IFOOD_AUTH_BASE_URL}/oauth/userCode`, new URLSearchParams({
                clientId: clientId
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { userCode, authorizationCodeVerifier, verificationUrl, verificationUrlComplete, expiresIn } = response.data;

            // Salva verifier temporariamente
            await tenantRepository.updateTenant(tenantId, {
                ifoodAuthVerifier: authorizationCodeVerifier
            });

            return { 
                url: verificationUrlComplete,
                userCode,
                verificationUrl,
                expiresIn
            };

        } catch (error) {
            console.error(`[iFood Auth] Error getting User Code:`, error.response?.data || error.message);
            
            if (error.response?.status === 403) {
                 throw new ApiError(403, 'Acesso negado pelo iFood. Verifique se o Client ID Global está aprovado.');
            }
            throw new ApiError(500, 'Falha ao iniciar conexão com iFood.');
        }
    },

    /**
     * Passo 2: Trocar Code (Authorization Code) por Token
     * Chamado quando o iFood redireciona de volta ou o frontend envia o código manual.
     */
    async requestNewAccessToken(tenantId, authCode = null) {
        const { clientId, clientSecret } = getGlobalCredentials();
        const tenant = await tenantRepository.getTenantById(tenantId);
        
        // Se usar fluxo User Code, o authCode pode vir do frontend, ou não ser necessário dependendo do fluxo exato.
        // No fluxo User Code puro, o App troca o User Code após o usuário confirmar? Não, o iFood chama o callback ou fazemos polling.
        // A implementação anterior sugeria um mix. Vamos assumir o fluxo Authorization Code padrão se authCode for passado.
        
        // Recuperar verifier se existir
        const codeVerifier = tenant?.ifoodAuthVerifier;

        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        
        if (authCode) {
            params.append('authorization_code', authCode);
        }
        
        if (codeVerifier) {
            params.append('authorization_code_verifier', codeVerifier);
        }

        try {
            console.log(`[iFood Auth] Exchanging code for token for tenant ${tenantId}`);
            
            const response = await ifoodAxios.post(`${IFOOD_AUTH_BASE_URL}/oauth/token`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            await this.saveTokenData(tenantId, response.data);
            
            // Buscar Merchant ID para confirmar vínculo
            await this.getIfoodMerchantData(tenantId);

            return response.data.accessToken;

        } catch (error) {
            console.error(`[iFood Auth] Exchange Token Error:`, error.response?.data || error.message);
            throw new ApiError(500, 'Falha ao finalizar conexão. O código pode ter expirado.');
        }
    },

    /**
     * Salva tokens e calcula expiração
     */
    async saveTokenData(tenantId, tokenData) {
        const { accessToken, refresh_token, expiresIn, access_token } = tokenData;
        const actualAccessToken = accessToken || access_token;
        const actualRefreshToken = refresh_token || tokenData.refreshToken;
        const actualExpiresIn = expiresIn || tokenData.expires_in;

        const expiresAt = new Date(Date.now() + (actualExpiresIn * 1000));

        await tenantRepository.updateTenant(tenantId, {
            ifoodAccessToken: actualAccessToken,
            ifoodRefreshToken: actualRefreshToken,
            ifoodTokenExpiresAt: expiresAt,
            ifoodAuthVerifier: null // Limpa o verifier após uso
        });
    },

    /**
     * Obtém token válido (renova se necessário)
     */
    async getValidToken(tenantId) {
        const tenant = await tenantRepository.getTenantById(tenantId);
        
        if (!tenant || !tenant.ifoodAccessToken) {
            throw new Error('Tenant sem token iFood.');
        }

        // Margem de segurança de 5 minutos
        const nowPlusBuffer = new Date(Date.now() + 5 * 60000);
        
        if (tenant.ifoodTokenExpiresAt && new Date(tenant.ifoodTokenExpiresAt) > nowPlusBuffer) {
            return tenant.ifoodAccessToken;
        }

        if (tenant.ifoodRefreshToken) {
            console.log(`[iFood Auth] Token expired for tenant ${tenantId}. Refreshing...`);
            return await this.refreshAccessToken(tenantId, tenant.ifoodRefreshToken);
        }

        throw new Error('Token expirado e sem refresh token.');
    },

    /**
     * Renova o Token usando Refresh Token
     */
    async refreshAccessToken(tenantId, refreshToken) {
        const { clientId, clientSecret } = getGlobalCredentials();

        try {
            const response = await ifoodAxios.post(`${IFOOD_AUTH_BASE_URL}/oauth/token`, new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            await this.saveTokenData(tenantId, response.data);
            return response.data.accessToken || response.data.access_token;

        } catch (error) {
            console.error(`[iFood Auth] Refresh Error for tenant ${tenantId}:`, error.response?.data || error.message);
            // Se falhar refresh, limpar tokens para evitar loop
            await tenantRepository.updateTenant(tenantId, {
                ifoodAccessToken: null,
                ifoodRefreshToken: null,
                ifoodTokenExpiresAt: null
            });
            throw new ApiError(401, 'Conexão iFood expirada. Reconecte a conta.');
        }
    },

    /**
     * Busca dados do Merchant (Loja) e salva ID
     */
    async getIfoodMerchantData(tenantId) {
        try {
            const token = await this.getValidToken(tenantId);
            
            const response = await ifoodAxios.get(`${IFOOD_MERCHANT_BASE_URL}/merchants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Pode retornar array ou objeto
            const merchants = Array.isArray(response.data) ? response.data : [response.data];
            const merchant = merchants[0]; // Pega o primeiro se houver vários

            if (merchant && merchant.id) {
                await tenantRepository.updateTenant(tenantId, {
                    ifoodMerchantId: merchant.id
                });
                console.log(`[iFood] Merchant ID ${merchant.id} linked to tenant ${tenantId}`);
                return merchant;
            }
            
            throw new Error('Nenhum estabelecimento encontrado na conta iFood.');

        } catch (error) {
            console.error(`[iFood] Get Merchant Error:`, error.message);
            throw error;
        }
    },

    // --- Polling System ---

    async runIfoodPolling() {
        console.log("[iFood Job] Starting Polling...");
        const tenants = await tenantRepository.findIfoodEnabledTenants();

        for (const tenant of tenants) {
            await this.pollEventsForTenant(tenant.id);
        }
    },

    async pollEventsForTenant(tenantId) {
        try {
            const token = await this.getValidToken(tenantId);
            
            const response = await ifoodAxios.get(`${IFOOD_EVENTS_BASE_URL}/events:polling`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const events = response.data || [];
            
            if (events.length > 0) {
                console.log(`[iFood Job] ${events.length} events for tenant ${tenantId}`);
                
                const processedIds = [];
                for (const event of events) {
                    await this.handleSingleEvent(tenantId, event);
                    processedIds.push({ id: event.id });
                }

                if (processedIds.length > 0) {
                    await this.acknowledgeEvents(tenantId, processedIds, token);
                }
            }

        } catch (error) {
            // Silenciar erros de polling comuns para não sujar log excessivamente
            if (error.response?.status !== 204) { // 204 No Content é normal
                 console.error(`[iFood Job] Polling Error Tenant ${tenantId}:`, error.message);
            }
        }
    },

    async handleSingleEvent(tenantId, event) {
        try {
            if (event.code === 'PLACED') {
                console.log(`[iFood] New Order: ${event.orderId} (Tenant ${tenantId})`);
                await this.processOrder(tenantId, event.orderId);
            }
            // Adicionar outros eventos aqui (CANCELLED, CONFIRMED, etc)
        } catch (e) {
            console.error(`[iFood] Event Handler Error:`, e.message);
        }
    },

    async acknowledgeEvents(tenantId, eventList, token) {
        try {
            await ifoodAxios.post(`${IFOOD_EVENTS_BASE_URL}/events/acknowledgment`, eventList, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error(`[iFood] ACK Error:`, error.message);
        }
    },

    // --- Processamento de Pedido ---

    async processOrder(tenantId, orderId) {
        try {
            const token = await this.getValidToken(tenantId);
            
            // Verificar se já existe
            const exists = await deliveryOrderRepository.findByPlatformAndOrderId('iFood', orderId);
            if (exists) return;

            // Buscar detalhes
            const response = await ifoodAxios.get(`${IFOOD_ORDER_BASE_URL}/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const order = response.data;

            // Buscar/Criar Cliente
            const phone = order.customer?.phone?.number?.replace(/\D/g, "") || null;
            let client = null;

            if (phone) {
                client = await clientRepository.findClientByPhone(phone, tenantId);
                if (!client) {
                    client = await clientRepository.createClient({
                        name: order.customer?.name || 'Cliente iFood',
                        phone: phone,
                        tenantId: tenantId
                    });
                }
            }

            // Salvar Pedido
            const newOrder = await deliveryOrderRepository.create({
                platform: 'iFood',
                orderIdPlatform: orderId,
                totalAmount: order.total?.value || 0,
                orderDate: new Date(order.createdAt),
                payload: order,
                clientId: client?.id || null,
                tenantId: tenantId
            });

            // Disparar Pesquisa (Se tiver cliente)
            if (client) {
                await surveyTriggerService.sendSatisfactionSurvey(client.id, tenantId, newOrder.id);
            }

        } catch (error) {
            console.error(`[iFood] Order Processing Error ${orderId}:`, error.message);
        }
    },
    
    // Alias para manter compatibilidade com rotas antigas se necessário
    async requestUserCode(tenantId) {
        return this.getAuthorizationUrl(tenantId);
    }
};

module.exports = ifoodService;
