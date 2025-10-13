const axios = require('axios');
const dotenv = require('dotenv');
const { WhatsappConfig, Tenant } = require('../../models'); // Import the model
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

const handleAxiosError = (error, tenantId, instanceName, isStatusCheck = false) => {
  console.error(`[WhatsappService] Error for tenant ${tenantId} (instance: ${instanceName}):`, error.message);

  if (error.response) {
    const { status, data } = error.response;
    console.error(`[WhatsappService] Response data:`, data);

    if (isStatusCheck && status === 404) {
      return { status: 'not_created', message: 'A instância existe localmente, mas não foi criada na API do WhatsApp.' };
    }

    if (status === 401) {
      return { status: 'error', code: `HTTP_${status}`, message: 'Falha na autenticação com a API do WhatsApp. Verifique a API Key.' };
    }
    if (status === 404) {
      return { status: 'error', code: `HTTP_${status}`, message: `A URL da API do WhatsApp não foi encontrada. Verifique a Base URL.` };
    }
    const errorMessage = (data && data.message) ? data.message : 'Erro desconhecido da API do WhatsApp.';
    return { status: 'error', code: `HTTP_${status}`, message: `A API do WhatsApp retornou um erro: ${errorMessage}` };

  } else if (error.request) {
    console.error(`[WhatsappService] No response received for request.`);
    return { status: 'error', code: 'NO_RESPONSE', message: 'Não foi possível conectar à API do WhatsApp. Verifique a Base URL e a conectividade da rede.' };

  } else {
    console.error(`[WhatsappService] Axios setup error:`, error.message);
    if (error.code === 'ENOTFOUND') {
        return { status: 'error', code: 'ENOTFOUND', message: `O endereço da API do WhatsApp não foi encontrado. Verifique se a Base URL está correta.` };
    }
    return { status: 'error', code: 'SETUP_FAILED', message: `Erro ao preparar a requisição para a API do WhatsApp: ${error.message}` };
  }
};

const getInstanceStatus = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName) return { status: 'not_created' }; // Alterado para not_created se não tiver instanceName

  try {
    const response = await axios.get(`${config.url}/instance/connectionState/${config.instanceName}`, getAxiosConfig(config));
    console.log(`[DEBUG] Evolution API connectionState response for ${config.instanceName}:`, response.data);
    const newStatus = (response.data.instance.state === 'CONNECTED' || response.data.instance.state === 'open') ? 'connected' : 'disconnected';
    console.log(`[DEBUG] Interpreted newStatus for ${config.instanceName}:`, newStatus);

    if (config.instanceStatus !== newStatus) {
      console.log(`[DEBUG] Updating instanceStatus for ${config.instanceName} from ${config.instanceStatus} to ${newStatus}`);
      await config.update({ instanceStatus: newStatus });
    } else {
      console.log(`[DEBUG] instanceStatus for ${config.instanceName} is already ${newStatus}. No update needed.`);
    }

    // Retorna apenas a string de status
    return newStatus;

  } catch (error) {
    const errorStatus = handleAxiosError(error, tenantId, config.instanceName, true);
    // Se a instância não foi encontrada na API, deleta a configuração local
    if (errorStatus.status === 'not_created') {
      await whatsappConfigRepository.deleteByTenantId(tenantId);
      return 'unconfigured'; // Retorna um status que a UI entende como "não configurado"
    }

    return errorStatus.status;
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

const createRemoteInstance = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.url || !config.apiKey) {
    throw new Error('URL ou API Key do WhatsApp não configuradas para este tenant.');
  }

  if (!config.instanceName) {
    const tenant = await Tenant.findByPk(tenantId);
    const newInstanceName = tenant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await config.update({ instanceName: newInstanceName });
    await config.reload(); // Recarrega para garantir que temos o instanceName
  }

  try {
    const response = await axios.post(
      `${config.url}/instance/create`,
      { 
        instanceName: config.instanceName,
        integration: 'WHATSAPP-BAILEYS' // Adiciona o tipo de integração
      },
      getAxiosConfig(config)
    );
    return response.data;
  } catch (error) {
    const apiResponse = error.response?.data?.response;
    const apiMessage = Array.isArray(apiResponse?.message) ? apiResponse.message[0] : '';

    // Trata tanto o erro 403 de nome em uso quanto o erro antigo de instância já existente
    if ((error.response?.status === 403 && apiMessage.includes('is already in use')) || 
        (error.response?.data?.message === 'Instance already exists')) {
      console.log(`[WhatsappService] Instância '${config.instanceName}' já existe. Continuando...`);
      return { status: 'success', code: 'INSTANCE_EXISTS', message: 'Instância já existe.' };
    }
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const getQrCodeForConnect = async (tenantId) => {
  // Garante que a instância exista antes de tentar conectar
  const createResult = await createRemoteInstance(tenantId);
  if (createResult && createResult.status === 'error' && createResult.code !== 'INSTANCE_EXISTS') {
    return createResult;
  }

  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  try {
    const response = await axios.get(`${config.url}/instance/connect/${config.instanceName}`, getAxiosConfig(config));
    return response.data;
  } catch (error) {
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const restartInstance = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName) return { message: "Instância não configurada." };

  try {
    const response = await axios.put(`${config.url}/instance/restart/${config.instanceName}`, {}, getAxiosConfig(config));
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
  sendTenantMessage,
  sendInstanteDetractorMessage,
  getInstanceStatus,
  getConnectionInfo,
  createRemoteInstance, // <-- Adicionada
  getQrCodeForConnect,  // <-- Renomeada
  restartInstance,
  logoutInstance,
  deleteInstance,
};
