const axios = require('axios');
const dotenv = require('dotenv');
const { WhatsappConfig } = require('../models'); // Import the model

dotenv.config();

const { SYSTEM_WHATSAPP_URL, SYSTEM_WHATSAPP_API_KEY, SYSTEM_WHATSAPP_INSTANCE } = process.env;

/**
 * Envia uma mensagem usando a instância GLOBAL do sistema.
 * Usado para alertas para os administradores do tenant.
 */
const sendSystemMessage = async (number, message) => {
  if (!SYSTEM_WHATSAPP_URL || !SYSTEM_WHATSAPP_API_KEY || !SYSTEM_WHATSAPP_INSTANCE) {
    console.error('Variáveis de ambiente do WhatsApp do sistema não configuradas.');
    throw new Error('WhatsApp do sistema não configurado.');
  }

  try {
    const response = await axios.post(`${SYSTEM_WHATSAPP_URL}/message/send`, {
      number: number,
      message: message,
      instance: SYSTEM_WHATSAPP_INSTANCE,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SYSTEM_WHATSAPP_API_KEY,
      },
    });

    console.log(`Mensagem de sistema enviada para ${number}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Falha ao enviar mensagem de sistema para ${number}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Envia uma mensagem usando a instância de um TENANT específico.
 * Usado para campanhas, lembretes, etc., para os clientes do tenant.
 */
const sendTenantMessage = async (tenantId, number, message) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });

  if (!config || !config.url || !config.apiKey || !config.instanceName) {
    console.error(`Configuração do WhatsApp não encontrada ou incompleta para o tenant ${tenantId}`);
    throw new Error('A configuração do WhatsApp para esta loja não foi encontrada ou está incompleta.');
  }

  if (config.instanceStatus !== 'connected') {
    console.error(`A instância do WhatsApp para o tenant ${tenantId} não está conectada.`);
    throw new Error('A instância do WhatsApp desta loja não está conectada.');
  }

  try {
    const response = await axios.post(`${config.url}/message/sendText`, { // Endpoint pode variar, ex: sendText
      number: number,
      options: {
        delay: 1200,
      },
      textMessage: {
        text: message,
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiKey,
      },
      params: {
        instance: config.instanceName
      }
    });

    console.log(`Mensagem do tenant ${tenantId} enviada para ${number}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Falha ao enviar mensagem do tenant ${tenantId} para ${number}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};


const sendInstanteDetractorMessage = async (tenant, detractorResponse) => {
    if (!tenant.reportPhoneNumber) {
        return;
    }

    const message = `
*Alerta de Detrator!* 😡

Um cliente deu uma nota baixa em uma de suas pesquisas.

- *Pesquisa:* ${detractorResponse.pesquisa.title}
- *Nota:* ${detractorResponse.ratingValue}
- *Comentário:* ${detractorResponse.textValue || 'Nenhum comentário.'}

_Recomendamos entrar em contato com o cliente o mais rápido possível._
    `.trim();

    // Continua usando o sendSystemMessage, o que está correto para esta função.
    await sendSystemMessage(tenant.reportPhoneNumber, message);
};


module.exports = {
  sendSystemMessage,
  sendTenantMessage, // Exporta a nova função
  sendInstanteDetractorMessage,
};
