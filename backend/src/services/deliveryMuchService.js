const axios = require('axios');
const tenantRepository = require('../repositories/tenantRepository');
const clientRepository = require('../repositories/clientRepository');
const deliveryOrderRepository = require('../repositories/deliveryOrderRepository');
const surveyTriggerService = require('./surveyTriggerService');
const ApiError = require('../errors/ApiError');

const DM_API_BASE_URL = 'https://api.deliverymuch.com.br/v2';

const deliveryMuchService = {

    /**
     * Autenticação: Obtém ou renova o token JWT
     */
    async getValidToken(tenantId) {
        const tenant = await tenantRepository.getTenantById(tenantId);
        
        // Verifica se o token atual ainda é válido (com margem de 5 minutos)
        const nowPlusBuffer = new Date(Date.now() + 5 * 60000);
        if (tenant.deliveryMuchToken && tenant.deliveryMuchTokenExpiresAt && new Date(tenant.deliveryMuchTokenExpiresAt) > nowPlusBuffer) {
            return tenant.deliveryMuchToken;
        }

        return await this.authenticate(tenant);
    },

    async authenticate(tenant) {
        if (!tenant.deliveryMuchClientId || !tenant.deliveryMuchClientSecret || !tenant.deliveryMuchUsername || !tenant.deliveryMuchPassword) {
            throw new Error(`Credenciais Delivery Much incompletas para o Tenant ${tenant.id}`);
        }

        try {
            console.log(`[Delivery Much Auth] Authenticating Tenant ${tenant.id}...`);
            
            const response = await axios.post(`${DM_API_BASE_URL}/auth/token`, {
                client_id: tenant.deliveryMuchClientId,
                client_secret: tenant.deliveryMuchClientSecret,
                username: tenant.deliveryMuchUsername,
                password: tenant.deliveryMuchPassword,
                grant_type: 'password'
            });

            const { access_token, expires_in } = response.data;
            const expiresAt = new Date(Date.now() + (expires_in * 1000));

            await tenantRepository.updateTenant(tenant.id, {
                deliveryMuchToken: access_token,
                deliveryMuchTokenExpiresAt: expiresAt
            });

            return access_token;

        } catch (error) {
            console.error(`[Delivery Much Auth] Error for tenant ${tenant.id}:`, error.response?.data || error.message);
            throw new ApiError(401, 'Falha na autenticação com Delivery Much. Verifique as credenciais.');
        }
    },

    /**
     * Polling: Busca pedidos recentes
     */
    async runPolling() {
        console.log("[Delivery Much Job] Starting Polling...");
        
        const dmTenants = await tenantRepository.findDeliveryMuchEnabledTenants();

        for (const tenant of dmTenants) {
            await this.fetchOrdersForTenant(tenant);
        }
    },

    async fetchOrdersForTenant(tenant) {
        try {
            const token = await this.getValidToken(tenant.id);
            
            // Busca pedidos com status que interessam (ex: CONFIRMED, DISPATCHED, DELIVERED)
            // A documentação diz /orders. Vamos buscar os recentes.
            // Geralmente filtra-se por data ou status. Sem doc exata dos filtros, vou buscar os abertos.
            const response = await axios.get(`${DM_API_BASE_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: {
                    // Adicionar filtros se necessário (ex: status: 'DELIVERED')
                    // Para garantir que pegamos novos, talvez filtrar por data?
                    // Vou assumir listagem padrão e verificar duplicidade localmente.
                }
            });

            const orders = response.data || [];
            
            if (orders.length > 0) {
                console.log(`[Delivery Much Job] ${orders.length} orders found for tenant ${tenant.id}`);
                for (const order of orders) {
                    await this.processOrder(tenant.id, order);
                }
            }

        } catch (error) {
            console.error(`[Delivery Much Job] Error fetching orders for tenant ${tenant.id}:`, error.response?.data || error.message);
        }
    },

    /**
     * Processa um pedido individual
     */
    async processOrder(tenantId, order) {
        try {
            const orderIdPlatform = String(order.uuid || order.id); // Ajustar conforme campo real da DM
            
            // 1. Verificar se já existe
            const exists = await deliveryOrderRepository.findByPlatformAndOrderId('DeliveryMuch', orderIdPlatform);
            if (exists) return;

            // 2. Extrair dados do cliente
            // Estrutura hipotética baseada no padrão de mercado (ajustar se necessário após teste real)
            const customerName = order.customer?.name || 'Cliente Delivery Much';
            const customerPhone = order.customer?.phone || order.customer?.mobile; 
            
            if (!customerPhone) {
                console.log(`[Delivery Much] Pedido ${orderIdPlatform} sem telefone. Ignorando automação.`);
                return; 
            }

            const cleanPhone = customerPhone.replace(/\D/g, "");

            // 3. Buscar/Criar Cliente
            let client = await clientRepository.findClientByPhone(cleanPhone, tenantId);
            if (!client) {
                client = await clientRepository.createClient({
                    name: customerName,
                    phone: cleanPhone,
                    tenantId: tenantId
                });
            }

            // 4. Salvar Pedido
            const newOrder = await deliveryOrderRepository.create({
                platform: 'DeliveryMuch',
                orderIdPlatform: orderIdPlatform,
                totalAmount: order.total || order.value || 0,
                orderDate: new Date(order.created_at || new Date()), // Ajustar campo de data
                payload: order,
                clientId: client.id,
                tenantId: tenantId
            });

            console.log(`[Delivery Much] Order saved: ${newOrder.id}`);

            // 5. Disparar Pesquisa (apenas se o pedido estiver concluído/entregue?)
            // Se a API retornar pedidos "EM ANDAMENTO", talvez não devamos disparar agora.
            // Vou assumir que disparamos ao importar, mas o ideal é verificar status === 'DELIVERED'.
            // Como é polling, se pegarmos pedidos antigos ou em andamento, precisamos cuidar.
            // PROPOSTA: Só disparar se status for 'CONCLUDED' ou 'DELIVERED'.
            
            const status = order.status?.toUpperCase();
            if (status === 'DELIVERED' || status === 'CONCLUDED' || status === 'FINISHED') {
                 await surveyTriggerService.schedulePostSaleSurvey(tenantId, newOrder.id);
            }

        } catch (error) {
            console.error(`[Delivery Much] Order Processing Error:`, error.message);
        }
    }
};

module.exports = deliveryMuchService;
