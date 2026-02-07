const surveyRepository = require("../repositories/surveyRepository");
const clientRepository = require("../repositories/clientRepository");
const whatsappService = require("./whatsappService");
const ApiError = require("../errors/ApiError");
const { WhatsappConfig, DeliveryOrder, Pesquisa } = require("../../models");

const surveyTriggerService = {
  // Novo Método: Agenda a pesquisa baseada na configuração do Tenant
  async schedulePostSaleSurvey(tenantId, deliveryOrderId) {
    try {
      const config = await WhatsappConfig.findOne({ where: { tenantId } });
      const delayMinutes = config ? config.postSaleDelayMinutes : 0;

      // Se delay for 0, marca para enviar "agora" (ou seja, o job vai pegar no próximo minuto)
      // Ou podemos decidir enviar imediatamente se for 0.
      // Para consistência, vamos agendar tudo. Se delay=0, scheduledAt = now.

      const now = new Date();
      const scheduledAt = new Date(now.getTime() + delayMinutes * 60000);

      await DeliveryOrder.update(
        {
          surveyStatus: "SCHEDULED",
          surveyScheduledAt: scheduledAt,
        },
        {
          where: { id: deliveryOrderId },
        },
      );

      console.log(
        `Pesquisa agendada para o pedido ${deliveryOrderId}. Delay: ${delayMinutes} min. Envio em: ${scheduledAt}`,
      );
    } catch (error) {
      console.error(
        `Erro ao agendar pesquisa para o pedido ${deliveryOrderId}:`,
        error,
      );
      await DeliveryOrder.update(
        { surveyStatus: "ERROR" },
        { where: { id: deliveryOrderId } },
      );
    }
  },

  // Mantém o método antigo para compatibilidade ou uso manual, mas agora com suporte a template customizado
  async sendSatisfactionSurvey(clientId, tenantId, deliveryOrderId) {
    try {
      // 1. Obter os dados do cliente para o telefone
      const client = await clientRepository.getClientById(clientId, tenantId);
      if (!client || !client.phone) {
        console.warn(
          `Cliente não encontrado ou sem telefone para clientId: ${clientId}, tenantId: ${tenantId}.`,
        );
        return;
      }

      // 2. Obter configuração do WhatsApp para template e survey específica
      const config = await WhatsappConfig.findOne({ where: { tenantId } });

      let survey = null;
      if (config && config.postSaleSurveyId) {
        survey = await Pesquisa.findByPk(config.postSaleSurveyId);
      }

      // Se não tiver específica configurada, pega a padrão
      if (!survey) {
        survey = await surveyRepository.findActiveDefaultSurvey(tenantId);
      }

      if (!survey) {
        console.warn(
          `Nenhuma pesquisa ativa encontrada para o tenantId: ${tenantId}.`,
        );
        return;
      }

      // 3. Construir a URL pública da pesquisa
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const publicSurveyUrl = `${frontendUrl}/pesquisa/${tenantId}/${survey.id}?clientId=${client.id}&deliveryOrderId=${deliveryOrderId}`;

      // 4. Montar a mensagem usando o template
      let messageTemplate =
        config?.postSaleMessageTemplate ||
        "Olá {{cliente}}! Agradecemos o seu pedido. Poderia nos dar um feedback rápido para melhorarmos? {{link_pesquisa}}";

      const message = messageTemplate
        .replace("{{cliente}}", client.name || "cliente")
        .replace("{{link_pesquisa}}", publicSurveyUrl)
        .replace("{{nome}}", client.name || "cliente"); // Alias comum

      // 5. Enviar a mensagem via WhatsApp
      await whatsappService.sendTenantMessage(tenantId, client.phone, message);

      // 6. Atualizar status no DeliveryOrder
      await DeliveryOrder.update(
        {
          surveyStatus: "SENT",
          surveySentAt: new Date(),
        },
        { where: { id: deliveryOrderId } },
      );

      console.log(
        `Pesquisa de satisfação enviada para ${client.phone} (Cliente ID: ${clientId}, Pedido ID: ${deliveryOrderId}).`,
      );
    } catch (error) {
      console.error(
        `Erro ao enviar pesquisa de satisfação para o cliente ${clientId} (tenant: ${tenantId}, pedido: ${deliveryOrderId}):`,
        error,
      );
      await DeliveryOrder.update(
        { surveyStatus: "ERROR" },
        { where: { id: deliveryOrderId } },
      );
      throw new ApiError(500, "Falha ao enviar pesquisa de satisfação.");
    }
  },
};

module.exports = surveyTriggerService;
