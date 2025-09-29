const axios = require('axios');
const dotenv = require('dotenv');
const { WhatsappConfig } = require('../../models'); // Import the model
const whatsappConfigRepository = require('../repositories/whatsappConfigRepository');

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


const getAxiosConfig = (config) => ({
  headers: { 'apikey': config.apiKey },
});

const handleAxiosError = (error, tenantId, instanceName) => {
  if (error.response && error.response.status === 404) {
    console.log(`Instância ${instanceName} não encontrada na Evolution API para o tenant ${tenantId}.`);
    return { error: 'not_found', message: 'Instância não encontrada na API do WhatsApp.' };
  }
  console.error(`Falha na comunicação com a Evolution API para o tenant ${tenantId}:`, error.response ? error.response.data : error.message);
  throw new Error('Falha na comunicação com a API do WhatsApp.');
};

const getInstanceStatus = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName) return { status: 'unconfigured' };

  try {
    const response = await axios.get(`${config.url}/instance/connectionState/${config.instanceName}`, getAxiosConfig(config));
    const newStatus = response.data.state === 'CONNECTED' ? 'connected' : 'disconnected';

    if (config.instanceStatus !== newStatus) {
      await config.update({ instanceStatus: newStatus });
    }

    return response.data;
  } catch (error) {
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const getConnectionInfo = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName) return { error: 'unconfigured' };

  try {
    const response = await axios.get(`${config.url}/instance/fetchInstance/${config.instanceName}`, getAxiosConfig(config));
    return response.data;
  } catch (error) {
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const createInstance = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName) {
    throw new Error('Configuração do WhatsApp ou nome da instância não encontrado.');
  }

  try {
    const response = await axios.post(`${config.url}/instance/create`, 
      { instanceName: config.instanceName }, 
      getAxiosConfig(config)
    );
    return response.data;
  } catch (error) {
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const getInstanceQrCode = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName) return { error: 'unconfigured' };

  try {
    const response = await axios.get(`${config.url}/instance/connect/${config.instanceName}`, getAxiosConfig(config));
    return response.data;
  } catch (error) {
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const logoutInstance = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName) return { message: "Instância já desconectada ou não configurada." };

  try {
    const response = await axios.delete(`${config.url}/instance/logout/${config.instanceName}`, getAxiosConfig(config));
    return response.data;
  } catch (error) {
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const deleteInstance = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName) {
    return { message: "Instância já removida ou não configurada." };
  }

  try {
    await axios.delete(`${config.url}/instance/delete/${config.instanceName}`, getAxiosConfig(config));
    await whatsappConfigRepository.deleteByTenantId(tenantId);
    return { message: "Instância deletada com sucesso." };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`Instância ${config.instanceName} não encontrada na Evolution API. Deletando do banco de dados local.`);
      await whatsappConfigRepository.deleteByTenantId(tenantId);
      return { message: "Instância não encontrada na API do WhatsApp, removida do sistema." };
    }
    throw error;
  }
};

module.exports = {
  sendSystemMessage,
  sendTenantMessage, // Exporta a nova função
  sendInstanteDetractorMessage,
  getInstanceStatus, // Exporta a nova função
  getConnectionInfo,
  createInstance,
  getInstanceQrCode,
  logoutInstance,
  deleteInstance,
};
