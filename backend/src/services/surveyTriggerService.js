const surveyRepository = require("../repositories/surveyRepository");
const clientRepository = require("../repositories/clientRepository");
const whatsappService = require("./whatsappService");
const ApiError = require("../errors/ApiError");

const surveyTriggerService = {
  async sendSatisfactionSurvey(clientId, tenantId, deliveryOrderId) {
    try {
      // 1. Obter os dados do cliente para o telefone
      const client = await clientRepository.getClientById(clientId, tenantId);
      if (!client || !client.phone) {
        console.warn(`Cliente não encontrado ou sem telefone para clientId: ${clientId}, tenantId: ${tenantId}.`);
        return; // Não é possível enviar a pesquisa sem o telefone
      }

      // 2. Obter uma pesquisa ativa para o tenant
      const survey = await surveyRepository.findActiveDefaultSurvey(tenantId);
      if (!survey) {
        console.warn(`Nenhuma pesquisa ativa padrão encontrada para o tenantId: ${tenantId}.`);
        return; // Não há pesquisa para enviar
      }

      // 3. Construir a URL pública da pesquisa
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const publicSurveyUrl = `${frontendUrl}/pesquisa/${tenantId}/${survey.id}?clientId=${client.id}&deliveryOrderId=${deliveryOrderId}`;

      // 4. Montar a mensagem
      const message = `Olá ${client.name || 'cliente'}! Agradecemos o seu pedido. Poderia nos dar um feedback rápido para melhorarmos? ${publicSurveyUrl}`;

      // 5. Enviar a mensagem via WhatsApp
      await whatsappService.sendTenantMessage(tenantId, client.phone, message);
      console.log(`Pesquisa de satisfação enviada para ${client.phone} (Cliente ID: ${clientId}, Pedido ID: ${deliveryOrderId}).`);

    } catch (error) {
      console.error(`Erro ao enviar pesquisa de satisfação para o cliente ${clientId} (tenant: ${tenantId}, pedido: ${deliveryOrderId}):`, error);
      // Lançar o erro ou lidar com ele de acordo com a política de erros da aplicação
      throw new ApiError(500, "Falha ao enviar pesquisa de satisfação.");
    }
  },
};

module.exports = surveyTriggerService;
