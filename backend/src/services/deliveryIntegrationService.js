const tenantRepository = require("../repositories/tenantRepository");
const clientRepository = require("../repositories/clientRepository");
const deliveryOrderRepository = require("../repositories/deliveryOrderRepository");
const ApiError = require("../errors/ApiError");
const surveyTriggerService = require("./surveyTriggerService"); // Importar o novo serviço de disparo de pesquisa

const deliveryIntegrationService = {
  processUaiRangoOrder: async function(payload) {
    console.log("Iniciando processamento do webhook do Uai Rango:", JSON.stringify(payload, null, 2));

    const uairangoEstablishmentId = String(payload.id_estabelecimento);
    const orderIdPlatform = String(payload.cod_pedido);

    try {
        // 1. Find Tenant
        const tenant = await tenantRepository.findByUaiRangoId(uairangoEstablishmentId);
        if (!tenant) {
            console.error(`[UaiRango Webhook] Tenant não encontrado para uairangoEstablishmentId: ${uairangoEstablishmentId}. Payload: ${JSON.stringify(payload)}`);
            return; // Interrompe o processamento se o tenant não for encontrado
        }

        console.log(`[UaiRango Webhook] Tenant encontrado: ${tenant.id} para o pedido ${orderIdPlatform}`);

        // 2. Find or Create Client
        const customerPhone = payload.cliente.celular.replace(/\D/g, "");
        let client = await clientRepository.findClientByPhone(customerPhone, tenant.id);

        if (!client) {
            client = await clientRepository.createClient({
                name: payload.cliente.nome,
                phone: customerPhone,
                tenantId: tenant.id,
            });
            console.log(`[UaiRango Webhook] Novo cliente criado: ${client.id} para o pedido ${orderIdPlatform}`);
        } else {
            console.log(`[UaiRango Webhook] Cliente existente encontrado: ${client.id} para o pedido ${orderIdPlatform}`);
        }

        // 3. Create DeliveryOrder
        const existingOrder = await deliveryOrderRepository.findByPlatformAndOrderId('UaiRango', orderIdPlatform);
        if (existingOrder) {
            console.log(`[UaiRango Webhook] Pedido ${orderIdPlatform} da plataforma UaiRango já existe. Ignorando.`);
            return;
        }

        const deliveryOrder = await deliveryOrderRepository.create({
            platform: 'UaiRango',
            orderIdPlatform: orderIdPlatform,
            totalAmount: parseFloat(payload.valor_total),
            orderDate: new Date(payload.data_pedido),
            payload: payload,
            clientId: client.id,
            tenantId: tenant.id,
        });
        console.log(`[UaiRango Webhook] DeliveryOrder criado: ${deliveryOrder.id} para o pedido ${orderIdPlatform}`);

        // 4. Trigger Survey Job
        await surveyTriggerService.sendSatisfactionSurvey(client.id, tenant.id, deliveryOrder.id);
        console.log(`[UaiRango Webhook] Disparo de pesquisa de satisfação solicitado para cliente ${client.id}, pedido ${deliveryOrder.id}.`);

    } catch (error) {
        console.error(`[UaiRango Webhook] Erro ao processar pedido ${orderIdPlatform}:`, error);
        // Aqui você poderia adicionar uma lógica para notificar um administrador ou enviar para uma fila de "dead-letter"
    }
},
};

module.exports = deliveryIntegrationService;
