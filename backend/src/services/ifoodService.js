const axios = require('axios');
const axiosRetryModule = require('axios-retry'); // Importa o módulo axios-retry
const axiosRetry = typeof axiosRetryModule === 'function' ? axiosRetryModule : axiosRetryModule.default; // Garante que axiosRetry é a função
const { Op } = require('sequelize');
const tenantRepository = require('../repositories/tenantRepository');
const clientRepository = require('../repositories/clientRepository');
const deliveryOrderRepository = require('../repositories/deliveryOrderRepository');
const surveyTriggerService = require('./surveyTriggerService');
const ApiError = require('../errors/ApiError');

// Configurar uma instância de axios com retry para as APIs do iFood
const ifoodAxios = axios.create();
axiosRetry(ifoodAxios, {
    retries: 3, // Número de retries
    retryDelay: axiosRetry.exponentialDelay, // Backoff exponencial
    retryCondition: (error) => {
        // Retenta em caso de erros de rede ou códigos de status 5xx ou 429
        return axiosRetry.isNetworkError(error) ||
               axiosRetry.isRetryableError(error.response.status) || // Retenta em caso de erro 5xx ou 429
               error.response?.status === 429; // Retenta especificamente para 429 Too Many Requests

    },
});

const IFOOD_AUTH_URL = process.env.IFOOD_AUTH_URL || 'https://sandbox.ifood.com.br/authentication/v1.0/oauth/token'; // Usar sandbox para desenvolvimento
const IFOOD_API_URL = process.env.IFOOD_API_URL || 'https://sandbox.ifood.com.br/order/v1.0'; // Usar sandbox para desenvolvimento
const IFOOD_EVENTS_URL = process.env.IFOOD_EVENTS_URL || 'https://sandbox.ifood.com.br/events/v1.0'; // Usar sandbox para desenvolvimento
const IFOOD_REDIRECT_URI = process.env.IFOOD_REDIRECT_URI; // Global, precisa ser registrado no iFood

// Não mais globais, serão por tenant
// const IFOOD_CLIENT_ID = process.env.IFOOD_CLIENT_ID;
// const IFOOD_CLIENT_SECRET = process.env.IFOOD_CLIENT_SECRET;

if (!IFOOD_REDIRECT_URI) {
    console.warn("IFOOD_REDIRECT_URI not set. iFood integration callback will not work.");
}

const ifoodService = {

    // --- Autenticação ---
    async getTenantIfoodConfig(tenantId) {
        const tenant = await tenantRepository.getTenantById(tenantId);
        if (!tenant) {
            throw new ApiError(404, 'Tenant not found.');
        }

        if (!tenant.ifoodClientId || !tenant.ifoodClientSecret) {
            throw new ApiError(400, 'iFood Client ID or Client Secret not configured for this tenant.');
        }
        
        return tenant;
    },

    async getAccessToken(tenantId) {
        const tenant = await this.getTenantIfoodConfig(tenantId);

        // Se o token de acesso existir e não estiver expirado, retorna-o
        if (tenant.ifoodAccessToken && tenant.ifoodTokenExpiresAt && new Date(tenant.ifoodTokenExpiresAt) > new Date()) {
            return tenant; // Retorna o tenant completo
        }

        // Se tiver um refresh token, tenta usá-lo
        if (tenant.ifoodRefreshToken) {
            console.log(`[iFood Service] Refreshing token for tenant: ${tenantId}`);
            await this.refreshAccessToken(tenantId, tenant.ifoodRefreshToken);
            return await this.getTenantIfoodConfig(tenantId); // Retorna o tenant atualizado
        }

        // Se não tiver nenhum token, precisa iniciar o fluxo de OAuth ou pedir ao usuário para configurar
        console.warn(`[iFood Service] No valid access or refresh token for tenant: ${tenantId}. Manual intervention might be needed.`);
        throw new ApiError(400, 'iFood tokens not available. Please configure iFood integration.');
    },

    async requestNewAccessToken(tenantId, authCode) {
        const tenant = await this.getTenantIfoodConfig(tenantId);

        try {
            const response = await ifoodAxios.post(IFOOD_AUTH_URL, new URLSearchParams({
                grant_type: 'authorization_code',
                code: authCode,
                client_id: tenant.ifoodClientId,
                client_secret: tenant.ifoodClientSecret,
                redirect_uri: IFOOD_REDIRECT_URI,
            }).toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, refresh_token, expires_in } = response.data;
            const ifoodTokenExpiresAt = new Date(new Date().getTime() + (expires_in * 1000));

            await tenantRepository.updateTenant(tenantId, {
                ifoodAccessToken: access_token,
                ifoodRefreshToken: refresh_token,
                ifoodTokenExpiresAt: ifoodTokenExpiresAt,
            });

            // Após obter os tokens, buscar e salvar o merchantId automaticamente
            await this.getIfoodMerchantData(tenantId);

            return access_token;
        } catch (error) {
            console.error(`[iFood Service] Error requesting new access token for tenant ${tenantId}:`, error.response?.data || error.message);
            throw new ApiError(500, 'Failed to request new iFood access token.');
        }
    },

    async refreshAccessToken(tenantId, refreshToken) {
        const tenant = await this.getTenantIfoodConfig(tenantId);

        try {
            const response = await ifoodAxios.post(IFOOD_AUTH_URL, new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: tenant.ifoodClientId,
                client_secret: tenant.ifoodClientSecret,
            }).toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, refresh_token, expires_in } = response.data;
            const ifoodTokenExpiresAt = new Date(new Date().getTime() + (expires_in * 1000));

            await tenantRepository.updateTenant(tenantId, {
                ifoodAccessToken: access_token,
                ifoodRefreshToken: refresh_token,
                ifoodTokenExpiresAt: ifoodTokenExpiresAt,
            });

            return access_token;
        } catch (error) {
            console.error(`[iFood Service] Error refreshing access token for tenant ${tenantId}:`, error.response?.data || error.message);
            await tenantRepository.updateTenant(tenantId, {
                ifoodAccessToken: null,
                ifoodRefreshToken: null,
                ifoodTokenExpiresAt: null,
            }); // Limpa tokens para evitar novas tentativas com tokens inválidos
            throw new ApiError(500, 'Failed to refresh iFood access token.');
        }
    },

    async getIfoodMerchantData(tenantId) {
        let tenantConfig;
        try {
            tenantConfig = await this.getAccessToken(tenantId);
        } catch (error) {
            throw new ApiError(400, `Could not get access token to fetch iFood merchant data.`);
        }

        try {
            // Este endpoint pode variar. Consulte a documentação do iFood.
            // Assumindo que retorna uma lista de merchants ou um único merchant associado ao token.
            const response = await ifoodAxios.get(`${IFOOD_API_URL}/merchants`, { // Endpoint comum para obter merchants
                headers: {
                    'Authorization': `Bearer ${tenantConfig.ifoodAccessToken}`,
                    'Accept': 'application/json',
                }
            });
            // Assumindo que a resposta contém um array de merchants ou um único objeto merchant
            const merchantData = Array.isArray(response.data) && response.data.length > 0
                                 ? response.data[0] // Pega o primeiro se for um array
                                 : response.data; // Ou a própria resposta se for um único objeto

            if (!merchantData || !merchantData.id) {
                throw new ApiError(500, 'Could not retrieve iFood merchant ID from API.');
            }

            // Atualiza o tenant com o merchantId obtido
            await tenantRepository.updateTenant(tenantId, {
                ifoodMerchantId: merchantData.id,
            });

            console.log(`[iFood Service] Merchant ID ${merchantData.id} saved for tenant ${tenantId}.`);
            return merchantData;

        } catch (error) {
            console.error(`[iFood Service] Error fetching iFood merchant data for tenant ${tenantId}:`, error.response?.data || error.message);
            throw new ApiError(500, 'Failed to fetch iFood merchant data.');
        }
    },

    // --- Polling de Eventos ---
    async pollEventsForTenant(tenantId) {
        let tenantConfig;
        try {
            tenantConfig = await this.getAccessToken(tenantId); // getAccessToken agora retorna o tenant completo
        } catch (error) {
            console.warn(`[iFood Service] Could not get iFood config for tenant ${tenantId}. Skipping polling.`, error.message);
            return;
        }

        try {
            const response = await ifoodAxios.get(`${IFOOD_EVENTS_URL}/events:polling`, {
                headers: {
                    'Authorization': `Bearer ${tenantConfig.ifoodAccessToken}`,
                    'Accept': 'application/json',
                }
            });

            const events = response.data;
            if (events && events.length > 0) {
                console.log(`[iFood Service] Found ${events.length} events for tenant ${tenantId}.`);
                const processedEventIds = [];

                for (const event of events) {
                    try {
                        if (event.code === 'PLACED_ORDER') { // Exemplo: Novo pedido
                            console.log(`[iFood Service] Processing PLACED_ORDER event for tenant ${tenantId}, order ID: ${event.payload.id}`);
                            await this.processIfoodOrder(tenantId, event.payload.id);
                        }
                        processedEventIds.push(event.id);
                    } catch (eventProcessError) {
                        console.error(`[iFood Service] Error processing iFood event ${event.id} for tenant ${tenantId}:`, eventProcessError.message);
                        // Continua para o próximo evento, mas não marca este como processado
                    }
                }

                if (processedEventIds.length > 0) {
                    await this.acknowledgeEvents(tenantId, processedEventIds);
                }
            } else {
                console.log(`[iFood Service] No new events for tenant ${tenantId}.`);
            }
        } catch (error) {
            console.error(`[iFood Service] Error polling events for tenant ${tenantId}:`, error.response?.data || error.message);
        }
    },

    async acknowledgeEvents(tenantId, eventIds) {
        let tenantConfig;
        try {
            tenantConfig = await this.getAccessToken(tenantId);
        } catch (error) {
            console.warn(`[iFood Service] Could not get iFood config for tenant ${tenantId}. Cannot acknowledge events.`, error.message);
            return;
        }

        try {
            await ifoodAxios.post(`${IFOOD_EVENTS_URL}/events/acknowledgment`, {
                events: eventIds.map(id => ({ id })),
            }, {
                headers: {
                    'Authorization': `Bearer ${tenantConfig.ifoodAccessToken}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log(`[iFood Service] Acknowledged ${eventIds.length} events for tenant ${tenantId}.`);
        } catch (error) {
            console.error(`[iFood Service] Error acknowledging events for tenant ${tenantId}:`, error.response?.data || error.message);
        }
    },

    // --- Processamento de Pedidos ---
    async getIfoodOrderDetails(tenantId, orderId) {
        let tenantConfig;
        try {
            tenantConfig = await this.getAccessToken(tenantId);
        } catch (error) {
            throw new ApiError(400, `Could not get access token to fetch iFood order ${orderId}.`);
        }

        try {
            const response = await ifoodAxios.get(`${IFOOD_API_URL}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${tenantConfig.ifoodAccessToken}`,
                    'Accept': 'application/json',
                }
            });
            return response.data;
        } catch (error) {
            console.error(`[iFood Service] Error fetching iFood order ${orderId} for tenant ${tenantId}:`, error.response?.data || error.message);
            throw new ApiError(500, `Failed to fetch iFood order ${orderId}.`);
        }
    },

    async processIfoodOrder(tenantId, ifoodOrderId) {
        console.log(`[iFood Service] Processing iFood order ${ifoodOrderId} for tenant ${tenantId}.`);

        // 1. Get Order Details from iFood
        const ifoodOrderDetails = await this.getIfoodOrderDetails(tenantId, ifoodOrderId);
        // if (ifoodOrderDetails.status !== 'CONFIRMED') { // Exemplo de filtro de status
        //     console.log(`[iFood Service] Order ${ifoodOrderId} is not in CONFIRMED status. Skipping.`);
        //     return;
        // }

        // 2. Check for existing DeliveryOrder
        const existingOrder = await deliveryOrderRepository.findByPlatformAndOrderId('iFood', ifoodOrderId);
        if (existingOrder) {
            console.log(`[iFood Service] Order ${ifoodOrderId} from iFood already exists. Skipping.`);
            return;
        }

        // 3. Find or Create Client
        const customerPhone = ifoodOrderDetails.customer?.phone?.number?.replace(/\D/g, "") || 'N/A'; // Ajustar conforme a estrutura real do payload do iFood
        let client = await clientRepository.findClientByPhone(customerPhone, tenantId);

        if (!client && customerPhone !== 'N/A') {
            client = await clientRepository.createClient({
                name: ifoodOrderDetails.customer?.name || 'Cliente iFood',
                phone: customerPhone,
                tenantId: tenantId,
            });
            console.log(`[iFood Service] New client created for iFood order ${ifoodOrderId}: ${client.id}`);
        } else if (client) {
            console.log(`[iFood Service] Existing client found for iFood order ${ifoodOrderId}: ${client.id}`);
        } else {
            console.warn(`[iFood Service] Could not create or find client for iFood order ${ifoodOrderId} (phone N/A).`);
        }

        // 4. Create DeliveryOrder
        const deliveryOrder = await deliveryOrderRepository.create({
            platform: 'iFood',
            orderIdPlatform: ifoodOrderId,
            totalAmount: parseFloat(ifoodOrderDetails.total?.value || 0),
            orderDate: new Date(ifoodOrderDetails.createdAt), // Ajustar conforme a estrutura real do payload do iFood
            payload: ifoodOrderDetails,
            clientId: client ? client.id : null, // Pode ser null se o cliente não foi encontrado/criado
            tenantId: tenantId,
        });
        console.log(`[iFood Service] DeliveryOrder created for iFood order ${ifoodOrderId}: ${deliveryOrder.id}`);

        // 5. Trigger Survey Job (if client was found/created)
        if (client) {
            await surveyTriggerService.sendSatisfactionSurvey(client.id, tenantId, deliveryOrder.id);
            console.log(`[iFood Service] Survey trigger requested for client ${client.id}, iFood order ${deliveryOrder.id}.`);
        } else {
            console.warn(`[iFood Service] Skipping survey trigger for iFood order ${deliveryOrder.id} as client was not identified.`);
        }
    },

    // --- Funções Auxiliares para o Job ---
    async runIfoodPolling() {
        console.log("[iFood Polling Job] Starting iFood polling for all active tenants...");
        const tenants = await tenantRepository.getTenants({
            where: {
                ifoodMerchantId: { [Op.ne]: null },
                ifoodAccessToken: { [Op.ne]: null },
                ifoodClientId: { [Op.ne]: null },
                ifoodClientSecret: { [Op.ne]: null },
            },
        });

        for (const tenant of tenants) {
            console.log(`[iFood Polling Job] Polling events for tenant: ${tenant.id} (Merchant ID: ${tenant.ifoodMerchantId})`);
            await this.pollEventsForTenant(tenant.id);
        }
        console.log("[iFood Polling Job] Finished iFood polling.");
    }
};

module.exports = ifoodService;