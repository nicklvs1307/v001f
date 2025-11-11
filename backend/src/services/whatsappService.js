const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { WhatsappConfig, Tenant } = require('../../models'); // Import the model
const whatsappConfigRepository = require('../repositories/whatsappConfigRepository');

dotenv.config();

const { SYSTEM_WHATSAPP_URL, SYSTEM_WHATSAPP_API_KEY, SYSTEM_WHATSAPP_INSTANCE } = process.env;

// Helper function to normalize phone numbers
const normalizeNumber = (number) => {
  let digitsOnly = String(number).replace(/\D/g, '');
  if (digitsOnly.length > 11 && digitsOnly.startsWith('55')) {
    digitsOnly = digitsOnly.substring(2);
  }
  // This logic for removing the 9th digit might need review for broader cases
  if (digitsOnly.length === 11) {
    const ddd = parseInt(digitsOnly.substring(0, 2), 10);
    if (ddd >= 11 && ddd <= 28) { // Common DDDs that have the 9th digit
      // It's generally safer to keep the 9th digit for mobile numbers
    }
  }
  return `55${digitsOnly}@s.whatsapp.net`;
};


const sendSystemMessage = async (number, message) => {
  if (!SYSTEM_WHATSAPP_URL || !SYSTEM_WHATSAPP_API_KEY || !SYSTEM_WHATSAPP_INSTANCE) {
    console.error('Variáveis de ambiente do WhatsApp do sistema não configuradas.');
    throw new Error('WhatsApp do sistema não configurado.');
  }
  const finalNumber = normalizeNumber(number);
  console.log(`[WhatsApp Service] Enviando mensagem de sistema para: ${finalNumber}`);

  try {
    const response = await axios.post(`${SYSTEM_WHATSAPP_URL}/message/sendText/${SYSTEM_WHATSAPP_INSTANCE}`, {
      number: finalNumber,
      text: message,
      options: { delay: 1200, presence: 'composing' }
    }, {
      headers: { 'Content-Type': 'application/json', 'apikey': SYSTEM_WHATSAPP_API_KEY },
    });
    console.log(`Mensagem de sistema enviada para ${finalNumber}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[WhatsApp Service] Falha ao enviar mensagem de sistema para ${finalNumber}.`);
    if (error.response) {
      console.error('[WhatsApp Service] Erro detalhado da API:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[WhatsApp Service] Erro sem resposta da API:', error.message);
    }
    throw error;
  }
};

const sendTenantMessage = async (tenantId, number, message) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });

  if (!config || !config.url || !config.apiKey || !config.instanceName) {
    throw new Error('A configuração do WhatsApp para esta loja não foi encontrada ou está incompleta.');
  }
  if (config.instanceStatus !== 'connected') {
    throw new Error('A instância do WhatsApp desta loja não está conectada.');
  }
  const finalNumber = normalizeNumber(number);
  console.log(`[WhatsApp Service] Enviando mensagem de tenant ${tenantId} para: ${finalNumber}`);

  try {
    const response = await axios.post(`${config.url}/message/sendText/${config.instanceName}`, {
      number: finalNumber,
      text: message,
      options: { delay: 1200, presence: 'composing' }
    }, {
      headers: { 'Content-Type': 'application/json', 'apikey': config.apiKey },
    });
    console.log(`Mensagem do tenant ${tenantId} enviada para ${number}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[WhatsApp Service] Falha ao enviar mensagem para o tenant ${tenantId}. Número: ${number}.`);
    if (error.response) {
      console.error('[WhatsApp Service] Erro detalhado da API:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[WhatsApp Service] Erro sem resposta da API:', error.message);
    }
    throw error;
  }
};

const sendTenantMediaMessage = async (tenantId, number, mediaUrl, caption) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });

  if (!config || !config.url || !config.apiKey || !config.instanceName) {
    throw new Error('A configuração do WhatsApp para esta loja não foi encontrada ou está incompleta.');
  }
  if (config.instanceStatus !== 'connected') {
    throw new Error('A instância do WhatsApp desta loja não está conectada.');
  }
  const finalNumber = normalizeNumber(number);
  console.log(`[WhatsApp Service] Enviando mensagem com mídia de tenant ${tenantId} para: ${finalNumber}`);

  const fullMediaUrl = `${process.env.BACKEND_URL}${mediaUrl}`;
  const extension = mediaUrl.split('.').pop().toLowerCase();
  const isAudio = ['mp3', 'ogg', 'wav', 'aac', 'mpeg'].includes(extension);
  const mimetype = isAudio ? `audio/${extension}` : `image/${extension === 'jpg' ? 'jpeg' : extension}`;
  const fileName = mediaUrl.split('/').pop();

  if (isAudio) {
    return sendTenantAudioMessage(tenantId, number, mediaUrl);
  }

  try {
    const response = await axios.post(`${config.url}/message/sendMedia/${config.instanceName}`, {
      number: finalNumber,
      mediatype: 'image',
      mimetype: mimetype,
      caption: caption,
      media: fullMediaUrl,
      fileName: fileName,
    }, {
      headers: { 'Content-Type': 'application/json', 'apikey': config.apiKey },
    });
    console.log(`Mensagem com mídia do tenant ${tenantId} enviada para ${number}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[WhatsApp Service] Falha ao enviar mensagem com mídia para o tenant ${tenantId}. Número: ${number}.`);
    if (error.response) {
      console.error('[WhatsApp Service] Erro detalhado da API:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[WhatsApp Service] Erro sem resposta da API:', error.message);
    }
    throw error;
  }
};

const sendTenantAudioMessage = async (tenantId, number, mediaUrl) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });

  if (!config || !config.url || !config.apiKey || !config.instanceName) {
    throw new Error('A configuração do WhatsApp para esta loja não foi encontrada ou está incompleta.');
  }
  if (config.instanceStatus !== 'connected') {
    throw new Error('A instância do WhatsApp desta loja não está conectada.');
  }
  const finalNumber = normalizeNumber(number);
  console.log(`[WhatsApp Service] Enviando mensagem de áudio de tenant ${tenantId} para: ${finalNumber}`);

  const fullMediaUrl = `${process.env.BACKEND_URL}${mediaUrl}`;

  try {
    const response = await axios.post(`${config.url}/message/sendWhatsAppAudio/${config.instanceName}`, {
      number: finalNumber,
      audio: fullMediaUrl,
    }, {
      headers: { 'Content-Type': 'application/json', 'apikey': config.apiKey },
    });
    console.log(`Mensagem de áudio do tenant ${tenantId} enviada para ${number}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[WhatsApp Service] Falha ao enviar mensagem de áudio para o tenant ${tenantId}. Número: ${number}.`);
    if (error.response) {
      console.error('[WhatsApp Service] Erro detalhado da API:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[WhatsApp Service] Erro sem resposta da API:', error.message);
    }
    throw error;
  }
};


// --- NEW METHODS FOR CAMPAIGN SENDER POOL ---

const sendCampaignMessage = async (sender, number, message, delay = 1200) => {
  const finalNumber = normalizeNumber(number);
  console.log(`[WhatsApp Service] Enviando mensagem de CAMPANHA com disparador ${sender.name} para: ${finalNumber}`);

  try {
    const response = await axios.post(`${sender.apiUrl}/message/sendText/${sender.instanceName}`, {
      number: finalNumber,
      text: message,
      options: { delay, presence: 'composing' }
    }, {
      headers: { 'Content-Type': 'application/json', 'apikey': sender.apiKey },
    });
    return response.data;
  } catch (error) {
    console.error(`[WhatsApp Service] Falha ao enviar mensagem de CAMPANHA com disparador ${sender.name}.`);
    if (error.response) {
      console.error('[WhatsApp Service] Erro detalhado da API:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[WhatsApp Service] Erro sem resposta da API:', error.message);
    }
    throw error; // Re-throw to be handled by campaignService
  }
};

const sendCampaignMediaMessage = async (sender, number, mediaUrl, caption, delay = 1200) => {
  const finalNumber = normalizeNumber(number);
  console.log(`[WhatsApp Service] Enviando mensagem de CAMPANHA com mídia com disparador ${sender.name} para: ${finalNumber}`);

  const fullMediaUrl = `${process.env.BACKEND_URL}${mediaUrl}`;
  const extension = mediaUrl.split('.').pop().toLowerCase();
  const isAudio = ['mp3', 'ogg', 'wav', 'aac', 'mpeg'].includes(extension);
  const mimetype = isAudio ? `audio/${extension}` : `image/${extension === 'jpg' ? 'jpeg' : extension}`;
  const fileName = mediaUrl.split('/').pop();

  if (isAudio) {
    return sendCampaignAudioMessage(sender, number, mediaUrl, delay);
  }

  try {
    const response = await axios.post(`${sender.apiUrl}/message/sendMedia/${sender.instanceName}`, {
      number: finalNumber,
      mediatype: 'image',
      mimetype: mimetype,
      caption: caption,
      media: fullMediaUrl,
      fileName: fileName,
    }, {
      headers: { 'Content-Type': 'application/json', 'apikey': sender.apiKey },
    });
    return response.data;
  } catch (error) {
    console.error(`[WhatsApp Service] Falha ao enviar mensagem de CAMPANHA com mídia com disparador ${sender.name}.`);
    if (error.response) {
      console.error('[WhatsApp Service] Erro detalhado da API:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[WhatsApp Service] Erro sem resposta da API:', error.message);
    }
    throw error; // Re-throw to be handled by campaignService
  }
};

const sendCampaignAudioMessage = async (sender, number, mediaUrl, delay = 1200) => {
  const finalNumber = normalizeNumber(number);
  console.log(`[WhatsApp Service] Enviando mensagem de CAMPANHA com áudio com disparador ${sender.name} para: ${finalNumber}`);

  const fullMediaUrl = `${process.env.BACKEND_URL}${mediaUrl}`;

  try {
    const response = await axios.post(`${sender.apiUrl}/message/sendWhatsAppAudio/${sender.instanceName}`, {
      number: finalNumber,
      audio: fullMediaUrl,
      options: { delay }
    }, {
      headers: { 'Content-Type': 'application/json', 'apikey': sender.apiKey },
    });
    return response.data;
  } catch (error) {
    console.error(`[WhatsApp Service] Falha ao enviar mensagem de CAMPANHA com áudio com disparador ${sender.name}.`);
    if (error.response) {
      console.error('[WhatsApp Service] Erro detalhado da API:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[WhatsApp Service] Erro sem resposta da API:', error.message);
    }
    throw error; // Re-throw to be handled by campaignService
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
  if (!config || !config.instanceName) return 'not_created';
  try {
    const response = await axios.get(`${config.url}/instance/connectionState/${config.instanceName}`, getAxiosConfig(config));
    const newStatus = (response.data.instance.state === 'CONNECTED' || response.data.instance.state === 'open') ? 'connected' : 'disconnected';
    if (config.instanceStatus !== newStatus) {
      await config.update({ instanceStatus: newStatus });
    }
    return newStatus;
  } catch (error) {
    const errorStatus = handleAxiosError(error, tenantId, config.instanceName, true);
    if (errorStatus.status === 'not_created') {
      await config.update({ instanceStatus: 'not_created', instanceName: null });
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
    await config.reload();
  }
  try {
    const webhookUrl = `${process.env.BACKEND_URL}/whatsapp-webhook/webhook`;
    const instanceApiKey = config.instanceApiKey || crypto.randomBytes(16).toString('hex');
    if (!config.instanceApiKey) {
      await config.update({ instanceApiKey });
    }

    const payload = {
      instanceName: config.instanceName,
      integration: 'WHATSAPP-BAILEYS',
      qrcode: true,
      webhook: {
        url: webhookUrl,
        enabled: true,
        events: [
          "QRCODE_UPDATED",
          "CONNECTION_UPDATE",
          "MESSAGES_UPSERT"
        ],
        headers: {
          'x-api-key': instanceApiKey
        }
      }
    };

    const response = await axios.post(
      `${config.url}/instance/create`,
      payload,
      getAxiosConfig(config)
    );

    const responseApiKey = response.data.hash || response.data.apikey;
    if (responseApiKey && responseApiKey !== instanceApiKey) {
      await config.update({ instanceApiKey: responseApiKey });
    }

    return response.data;
  } catch (error) {
    const apiResponse = error.response?.data?.response;
    const apiMessage = Array.isArray(apiResponse?.message) ? apiResponse.message[0] : '';
    if ((error.response?.status === 403 && apiMessage.includes('is already in use')) || (error.response?.data?.message === 'Instance already exists')) {
      return { status: 'success', code: 'INSTANCE_EXISTS', message: 'Instância já existe.' };
    }
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const getQrCodeForConnect = async (tenantId) => {
  console.log(`[WhatsappService] Attempting to generate a new QR Code for tenant ${tenantId}.`);
  
  // Primeiro, tenta fazer logout para garantir uma sessão limpa.
  try {
    console.log(`[WhatsappService] Logging out instance for tenant ${tenantId} before generating new QR code.`);
    await logoutInstance(tenantId);
    // Pausa para dar tempo à API para processar o logout
    await new Promise(resolve => setTimeout(resolve, 1500)); 
  } catch (error) {
    // Se o logout falhar (por exemplo, se já estiver desconectado), apenas registramos e continuamos.
    console.warn(`[WhatsappService] Non-critical error during pre-emptive logout for tenant ${tenantId}. It might have been already disconnected. Proceeding to get new QR code.`, error.message);
  }

  const createResult = await createRemoteInstance(tenantId);
  if (createResult && createResult.status === 'error' && createResult.code !== 'INSTANCE_EXISTS') {
    return createResult;
  }

  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config) {
    throw new Error(`Configuration for tenant ${tenantId} not found after create/check.`);
  }

  try {
    console.log(`[WhatsappService] Fetching new QR code from API for instance ${config.instanceName}.`);
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
      await whatsappConfigRepository.deleteByTenantId(tenantId);
      return { message: "Instância não encontrada na API do WhatsApp, removida do sistema." };
    }
    throw error;
  }
};

// --- NEW METHODS FOR SENDER POOL INSTANCE MANAGEMENT ---

const getSenderInstanceStatus = async (sender) => {
  if (!sender || !sender.instanceName) return 'not_created';
  try {
    const response = await axios.get(`${sender.apiUrl}/instance/connectionState/${sender.instanceName}`, { headers: { 'apikey': sender.apiKey } });
    const newStatus = (response.data.instance.state === 'CONNECTED' || response.data.instance.state === 'open') ? 'active' : 'disconnected';
    if (sender.status !== newStatus) {
      await sender.update({ status: newStatus });
    }
    return newStatus;
  } catch (error) {
    // Using a generic error handler as we don't have a tenantId
    console.error(`[WhatsappService] Error getting status for sender ${sender.name}:`, error.message);
    if (sender.status !== 'disconnected') {
        await sender.update({ status: 'disconnected' });
    }
    return 'disconnected';
  }
};

const createSenderRemoteInstance = async (sender) => {
  if (!sender || !sender.apiUrl || !sender.apiKey || !sender.instanceName) {
    throw new Error('Dados do disparador incompletos para criar instância remota.');
  }
  console.log(`[WhatsappService] createSenderRemoteInstance: sender.apiUrl = ${sender.apiUrl}`);
  try {
    const webhookUrl = `${process.env.BACKEND_URL}/superadmin/senders/webhook`;
    const payload = {
      instanceName: sender.instanceName,
      integration: 'WHATSAPP-BAILEYS',
      qrcode: true,
      webhook: {
        url: webhookUrl,
        enabled: true,
        events: [
          "QRCODE_UPDATED",
          "CONNECTION_UPDATE",
        ],
        headers: {
          'x-api-key': process.env.WHATSAPP_API_KEY
        }
      }
    };

    await axios.post(
      `${sender.apiUrl}/instance/create`,
      payload,
      { headers: { 'apikey': sender.apiKey } }
    );
    return { status: 'success', message: 'Instância criada ou já existente.' };
  } catch (error) {
    const apiResponse = error.response?.data?.response;
    const apiMessage = Array.isArray(apiResponse?.message) ? apiResponse.message[0] : '';
    if ((error.response?.status === 403 && apiMessage.includes('is already in use')) || (error.response?.data?.message === 'Instance already exists')) {
      return { status: 'success', code: 'INSTANCE_EXISTS', message: 'Instância já existe.' };
    }
    console.error(`[WhatsappService] Error creating remote instance for sender ${sender.name}:`, error.message);
    throw error;
  }
};

const getSenderQrCodeForConnect = async (sender) => {
  const createResult = await createSenderRemoteInstance(sender);
  if (createResult && createResult.status === 'success' && createResult.code === 'INSTANCE_EXISTS') {
    // If instance already exists, check its connection status
    const currentStatus = await getSenderInstanceStatus(sender);
    if (currentStatus === 'active') {
      // If already active, no QR code needed
      return { qrCode: '' };
    }
    // If not active, proceed to get QR code
  }
  try {
    const response = await axios.get(`${sender.apiUrl}/instance/connect/${sender.instanceName}`, { headers: { 'apikey': sender.apiKey } });
    return response.data;
  } catch (error) {
    console.error(`[WhatsappService] Error getting QR code for sender ${sender.name}:`, error.message);
    throw error;
  }
};

const deleteSenderInstance = async (sender) => {
  if (!sender || !sender.instanceName) {
    return { message: "Instância do disparador já removida ou não configurada." };
  }
  console.log(`[WhatsappService] deleteSenderInstance: sender.apiUrl = ${sender.apiUrl}`);
  try {
    await axios.delete(`${sender.apiUrl}/instance/delete/${sender.instanceName}`, { headers: { 'apikey': sender.apiKey } });
    return { message: "Instância do disparador deletada com sucesso." };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { message: "Instância do disparador não encontrada na API do WhatsApp, pode ser removida do sistema." };
    }
    throw error;
  }
};


const getAllInstanceStatuses = async () => {
  const configs = await WhatsappConfig.findAll({
    include: [{ model: Tenant, as: 'tenant', attributes: ['id', 'name'] }]
  });

  const statuses = await Promise.all(
    configs.map(async (config) => {
      const status = await getInstanceStatus(config.tenantId);
      return {
        ...config.get({ plain: true }),
        status,
      };
    })
  );

  return statuses;
};

const restartSenderInstance = async (sender) => {
  if (!sender || !sender.instanceName) return { message: "Instância do disparador não configurada." };
  try {
    const response = await axios.put(`${sender.apiUrl}/instance/restart/${sender.instanceName}`, {}, { headers: { 'apikey': sender.apiKey } });
    return response.data;
  } catch (error) {
    console.error(`[WhatsappService] Error restarting sender instance ${sender.name}:`, error.message);
    throw error;
  }
};

const logoutSenderInstance = async (sender) => {
  if (!sender || !sender.instanceName) return { message: "Instância do disparador já desconectada ou não configurada." };
  try {
    const response = await axios.delete(`${sender.apiUrl}/instance/logout/${sender.instanceName}`, { headers: { 'apikey': sender.apiKey } });
    return response.data;
  } catch (error) {
    console.error(`[WhatsappService] Error logging out sender instance ${sender.name}:`, error.message);
    throw error;
  }
};

module.exports = {
  sendSystemMessage,
  sendTenantMessage,
  sendTenantMediaMessage,
  sendTenantAudioMessage,
  sendCampaignMessage, // Export new method
  sendCampaignMediaMessage, // Export new method
  sendCampaignAudioMessage,
  sendInstanteDetractorMessage,
  getInstanceStatus,
  getConnectionInfo,
  createRemoteInstance,
  getQrCodeForConnect,
  restartInstance,
  logoutInstance,
  deleteInstance,
  getAllInstanceStatuses,
  getSenderInstanceStatus,    // Export new method
  createSenderRemoteInstance, // Export new method
  getSenderQrCodeForConnect,  // Export new method
  restartSenderInstance,      // Export new method
  logoutSenderInstance,       // Export new method
  deleteSenderInstance,
};
