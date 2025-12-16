const axios = require("axios");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { WhatsappConfig, Tenant } = require("../../models"); // Import the model
const whatsappConfigRepository = require("../repositories/whatsappConfigRepository");
const tenantRepository = require("../repositories/tenantRepository");

dotenv.config();

const {
  SYSTEM_WHATSAPP_URL,
  SYSTEM_WHATSAPP_API_KEY,
  SYSTEM_WHATSAPP_INSTANCE,
} = process.env;

// Helper function to normalize phone numbers
const normalizeNumber = (number) => {
  if (!number) {
    return null;
  }

  // 1. Remove todos os caracteres não numéricos
  let digitsOnly = String(number).replace(/\D/g, "");

  // 2. Se o número começar com 55 e tiver mais de 11 dígitos, remove o 55 inicial.
  // Isso normaliza números que já estão no formato internacional.
  if (digitsOnly.startsWith("55") && digitsOnly.length > 11) {
    digitsOnly = digitsOnly.substring(2);
  }

  // 3. Lógica para adicionar o 9º dígito em celulares
  // A maioria dos DDDs de celular no Brasil tem 11 dígitos (DDD + 9 dígitos).
  // Se tiver 10 dígitos (DDD + 8 dígitos), é provável que o '9' esteja faltando.
  if (digitsOnly.length === 10) {
    const ddd = parseInt(digitsOnly.substring(0, 2), 10);
    // DDDs de 11 a 99 são os intervalos de celular no Brasil que usam o 9º dígito
    if (ddd >= 11 && ddd <= 99) {
      const numberWithoutDDD = digitsOnly.substring(2);
      digitsOnly = `${ddd}9${numberWithoutDDD}`;
    }
  }

  // 4. Retorna o número no formato JID do WhatsApp
  return `55${digitsOnly}@s.whatsapp.net`;
};

const checkWhatsAppNumber = async (config, number) => {
  const numberForCheck = normalizeNumber(number).split("@")[0];

  try {
    const response = await axios.post(
      `${config.url}/chat/whatsappNumbers/${config.instanceName}`,
      { numbers: [numberForCheck] },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: config.apiKey,
        },
      },
    );

    if (
      response.data &&
      Array.isArray(response.data) &&
      response.data.length > 0
    ) {
      const checkResult = response.data[0];
      if (checkResult.exists) {
        console.log(
          `[WhatsApp Service] Number check successful for: ${checkResult.jid}`,
        );
        return true;
      }
    }
    console.warn(
      `[WhatsApp Service] Number ${numberForCheck} does not exist on WhatsApp.`,
    );
    return false;
  } catch (error) {
    console.error(
      `[WhatsApp Service] Failed to check number ${numberForCheck}.`,
      error.message,
    );
    // Em caso de erro na verificação, bloqueamos o envio para evitar problemas.
    return false;
  }
};

const sendSystemMessage = async (number, message) => {
  if (
    !SYSTEM_WHATSAPP_URL ||
    !SYSTEM_WHATSAPP_API_KEY ||
    !SYSTEM_WHATSAPP_INSTANCE
  ) {
    console.error(
      "Variáveis de ambiente do WhatsApp do sistema não configuradas.",
    );
    throw new Error("WhatsApp do sistema não configurado.");
  }

  // Cria uma configuração temporária para a verificação do número
  const systemConfig = {
    url: SYSTEM_WHATSAPP_URL,
    apiKey: SYSTEM_WHATSAPP_API_KEY,
    instanceName: SYSTEM_WHATSAPP_INSTANCE,
  };

  const numberExists = await checkWhatsAppNumber(systemConfig, number);
  if (!numberExists) {
    const errorMessage = `[WhatsApp Service] Tentativa de envio de mensagem de SISTEMA para número inexistente (${number}). Abortando.`;
    console.error(errorMessage);
    throw new Error(
      "O número de WhatsApp fornecido para a mensagem de sistema não existe.",
    );
  }

  const finalNumber = normalizeNumber(number);
  console.log(
    `[WhatsApp Service] Enviando mensagem de sistema para: ${finalNumber}`,
  );

  try {
    const response = await axios.post(
      `${SYSTEM_WHATSAPP_URL}/message/sendText/${SYSTEM_WHATSAPP_INSTANCE}`,
      {
        number: finalNumber,
        text: message,
        options: { delay: 1200, presence: "composing" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: SYSTEM_WHATSAPP_API_KEY,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      `[WhatsApp Service] Falha ao enviar mensagem de sistema para ${finalNumber}.`,
    );
    if (error.response) {
      console.error(
        "[WhatsApp Service] Erro detalhado da API:",
        JSON.stringify(error.response.data, null, 2),
      );
    } else {
      console.error(
        "[WhatsApp Service] Erro sem resposta da API:",
        error.message,
      );
    }
    throw error;
  }
};

const getTenantWhatsappConfig = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });

  if (!config || !config.url || !config.apiKey || !config.instanceName) {
    throw new Error(
      "A configuração do WhatsApp para esta loja não foi encontrada ou está incompleta.",
    );
  }

  // Verificação em tempo real do status da instância
  const currentStatus = await getInstanceStatus(tenantId);
  if (currentStatus !== "connected") {
    throw new Error("A instância do WhatsApp desta loja não está conectada.");
  }

  return config;
};

const sendTenantMessage = async (tenantId, number, message) => {
  const config = await getTenantWhatsappConfig(tenantId);

  // Verifica se o número existe antes de enviar
  const numberExists = await checkWhatsAppNumber(config, number);
  if (!numberExists) {
    const errorMessage = `[WhatsApp Service] Tentativa de envio para número inexistente no WhatsApp (${number}) no tenant ${tenantId}. Abortando.`;
    console.error(errorMessage);
    // Lança um erro claro que pode ser tratado pelo chamador
    throw new Error("O número de WhatsApp fornecido não existe ou não pôde ser verificado.");
  }

  const finalNumber = normalizeNumber(number);
  console.log(
    `[WhatsApp Service] Enviando mensagem de tenant ${tenantId} para: ${finalNumber}`,
  );

  try {
    const response = await axios.post(
      `${config.url}/message/sendText/${config.instanceName}`,
      {
        number: finalNumber,
        text: message,
        options: { delay: 1200, presence: "composing" },
      },
      {
        headers: { "Content-Type": "application/json", apikey: config.apiKey },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      `[WhatsApp Service] Falha ao enviar mensagem para o tenant ${tenantId}. Número: ${finalNumber}.`,
    );
    if (error.response) {
      console.error(
        "[WhatsApp Service] Erro detalhado da API:",
        JSON.stringify(error.response.data, null, 2),
      );
    } else {
      console.error(
        "[WhatsApp Service] Erro sem resposta da API:",
        error.message,
      );
    }
    throw error;
  }
};

const sendTenantMediaMessage = async (tenantId, number, mediaUrl, caption) => {
  const config = await getTenantWhatsappConfig(tenantId);

  const numberExists = await checkWhatsAppNumber(config, number);
  if (!numberExists) {
    const errorMessage = `[WhatsApp Service] Tentativa de envio de mídia para número inexistente (${number}) no tenant ${tenantId}. Abortando.`;
    console.error(errorMessage);
    throw new Error("O número de WhatsApp fornecido não existe ou não pôde ser verificado.");
  }

  const finalNumber = normalizeNumber(number);
  console.log(
    `[WhatsApp Service] Enviando mensagem com mídia de tenant ${tenantId} para: ${finalNumber}`,
  );

  const fullMediaUrl = `${process.env.BACKEND_URL}${mediaUrl}`;
  const extension = mediaUrl.split(".").pop().toLowerCase();
  const isAudio = ["mp3", "ogg", "wav", "aac", "mpeg"].includes(extension);
  const mimetype = isAudio
    ? `audio/${extension}`
    : `image/${extension === "jpg" ? "jpeg" : extension}`;
  const fileName = mediaUrl.split("/").pop();

  if (isAudio) {
    return sendTenantAudioMessage(tenantId, number, mediaUrl);
  }

  try {
    const response = await axios.post(
      `${config.url}/message/sendMedia/${config.instanceName}`,
      {
        number: finalNumber,
        mediatype: "image",
        mimetype: mimetype,
        caption: caption,
        media: fullMediaUrl,
        fileName: fileName,
      },
      {
        headers: { "Content-Type": "application/json", apikey: config.apiKey },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      `[WhatsApp Service] Falha ao enviar mensagem com mídia para o tenant ${tenantId}. Número: ${finalNumber}.`,
    );
    if (error.response) {
      console.error(
        "[WhatsApp Service] Erro detalhado da API:",
        JSON.stringify(error.response.data, null, 2),
      );
    } else {
      console.error(
        "[WhatsApp Service] Erro sem resposta da API:",
        error.message,
      );
    }
    throw error;
  }
};

const sendTenantAudioMessage = async (tenantId, number, mediaUrl) => {
  const config = await getTenantWhatsappConfig(tenantId);

  const numberExists = await checkWhatsAppNumber(config, number);
  if (!numberExists) {
    const errorMessage = `[WhatsApp Service] Tentativa de envio de áudio para número inexistente (${number}) no tenant ${tenantId}. Abortando.`;
    console.error(errorMessage);
    throw new Error("O número de WhatsApp fornecido não existe ou não pôde ser verificado.");
  }

  const finalNumber = normalizeNumber(number);
  console.log(
    `[WhatsApp Service] Enviando mensagem de áudio de tenant ${tenantId} para: ${finalNumber}`,
  );

  const fullMediaUrl = `${process.env.BACKEND_URL}${mediaUrl}`;

  try {
    const response = await axios.post(
      `${config.url}/message/sendWhatsAppAudio/${config.instanceName}`,
      {
        number: finalNumber,
        audio: fullMediaUrl,
      },
      {
        headers: { "Content-Type": "application/json", apikey: config.apiKey },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      `[WhatsApp Service] Falha ao enviar mensagem de áudio para o tenant ${tenantId}. Número: ${finalNumber}.`,
    );
    if (error.response) {
      console.error(
        "[WhatsApp Service] Erro detalhado da API:",
        JSON.stringify(error.response.data, null, 2),
      );
    } else {
      console.error(
        "[WhatsApp Service] Erro sem resposta da API:",
        error.message,
      );
    }
    throw error;
  }
};

// --- NEW METHODS FOR CAMPAIGN SENDER POOL ---

const sendCampaignRequest = async (sender, endpoint, payload) => {
  try {
    const response = await axios.post(
      `${sender.apiUrl}/${endpoint}/${sender.instanceName}`,
      payload,
      {
        headers: { "Content-Type": "application/json", apikey: sender.apiKey },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      `[WhatsApp Service] Falha ao enviar mensagem de CAMPANHA com disparador ${sender.name}.`,
    );
    if (error.response) {
      console.error(
        "[WhatsApp Service] Erro detalhado da API:",
        JSON.stringify(error.response.data, null, 2),
      );
    } else {
      console.error(
        "[WhatsApp Service] Erro sem resposta da API:",
        error.message,
      );
    }
    throw error; // Re-throw to be handled by campaignService
  }
};

const sendCampaignMessage = async (sender, number, message, delay = 1200) => {
  // O objeto 'sender' tem a mesma estrutura que 'config' (url, apiKey, instanceName)
  const numberExists = await checkWhatsAppNumber(sender, number);
  if (!numberExists) {
    const errorMessage = `[WhatsApp Service] Tentativa de envio de CAMPANHA para número inexistente (${number}) com o disparador ${sender.name}. Abortando.`;
    console.error(errorMessage);
    throw new Error(
      "O número de WhatsApp fornecido para a campanha não existe ou não pôde ser verificado.",
    );
  }

  const finalNumber = normalizeNumber(number);
  console.log(
    `[WhatsApp Service] Enviando mensagem de CAMPANHA com disparador ${sender.name} para: ${finalNumber}`,
  );

  const payload = {
    number: finalNumber,
    text: message,
    options: { delay, presence: "composing" },
  };

  return sendCampaignRequest(sender, "message/sendText", payload);
};

const sendCampaignMediaMessage = async (
  sender,
  number,
  mediaUrl,
  caption,
  delay = 1200,
) => {
  const numberExists = await checkWhatsAppNumber(sender, number);
  if (!numberExists) {
    const errorMessage = `[WhatsApp Service] Tentativa de envio de CAMPANHA com mídia para número inexistente (${number}) com o disparador ${sender.name}. Abortando.`;
    console.error(errorMessage);
    throw new Error(
      "O número de WhatsApp fornecido para a campanha não existe ou não pôde ser verificado.",
    );
  }

  const finalNumber = normalizeNumber(number);
  console.log(
    `[WhatsApp Service] Enviando mensagem de CAMPANHA com mídia com disparador ${sender.name} para: ${finalNumber}`,
  );

  const fullMediaUrl = `${process.env.BACKEND_URL}${mediaUrl}`;
  const extension = mediaUrl.split(".").pop().toLowerCase();
  const isAudio = ["mp3", "ogg", "wav", "aac", "mpeg"].includes(extension);
  const mimetype = isAudio
    ? `audio/${extension}`
    : `image/${extension === "jpg" ? "jpeg" : extension}`;
  const fileName = mediaUrl.split("/").pop();

  if (isAudio) {
    return sendCampaignAudioMessage(sender, number, mediaUrl, delay);
  }

  const payload = {
    number: finalNumber,
    mediatype: "image",
    mimetype: mimetype,
    caption: caption,
    media: fullMediaUrl,
    fileName: fileName,
  };

  return sendCampaignRequest(sender, "message/sendMedia", payload);
};

const sendCampaignAudioMessage = async (
  sender,
  number,
  mediaUrl,
  delay = 1200,
) => {
  const numberExists = await checkWhatsAppNumber(sender, number);
  if (!numberExists) {
    const errorMessage = `[WhatsApp Service] Tentativa de envio de CAMPANHA com áudio para número inexistente (${number}) com o disparador ${sender.name}. Abortando.`;
    console.error(errorMessage);
    throw new Error(
      "O número de WhatsApp fornecido para a campanha não existe ou não pôde ser verificado.",
    );
  }

  const finalNumber = normalizeNumber(number);
  console.log(
    `[WhatsApp Service] Enviando mensagem de CAMPANHA com áudio com disparador ${sender.name} para: ${finalNumber}`,
  );

  const fullMediaUrl = `${process.env.BACKEND_URL}${mediaUrl}`;

  const payload = {
    number: finalNumber,
    audio: fullMediaUrl,
    options: { delay },
  };

  return sendCampaignRequest(sender, "message/sendWhatsAppAudio", payload);
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
- *Comentário:* ${detractorResponse.textValue || "Nenhum comentário."}
_Recomendamos entrar em contato com o cliente o mais rápido possível._
    `.trim();
  await sendSystemMessage(tenant.reportPhoneNumber, message);
};

const getAxiosConfig = (config) => ({
  headers: { apikey: config.apiKey },
});

const handleAxiosError = (
  error,
  tenantId,
  instanceName,
  isStatusCheck = false,
) => {
  console.error(
    `[WhatsappService] Error for tenant ${tenantId} (instance: ${instanceName}):`,
    error.message,
  );
  if (error.response) {
    const { status, data } = error.response;
    console.error(`[WhatsappService] Response data:`, data);
    if (isStatusCheck && status === 404) {
      return {
        status: "not_created",
        message:
          "A instância existe localmente, mas não foi criada na API do WhatsApp.",
      };
    }
    if (status === 401) {
      return {
        status: "error",
        code: `HTTP_${status}`,
        message:
          "Falha na autenticação com a API do WhatsApp. Verifique a API Key.",
      };
    }
    if (status === 404) {
      return {
        status: "error",
        code: `HTTP_${status}`,
        message: `A URL da API do WhatsApp não foi encontrada. Verifique a Base URL.`,
      };
    }
    const errorMessage =
      data && data.message
        ? data.message
        : "Erro desconhecido da API do WhatsApp.";
    return {
      status: "error",
      code: `HTTP_${status}`,
      message: `A API do WhatsApp retornou um erro: ${errorMessage}`,
    };
  } else if (error.request) {
    console.error(`[WhatsappService] No response received for request.`);
    return {
      status: "error",
      code: "NO_RESPONSE",
      message:
        "Não foi possível conectar à API do WhatsApp. Verifique a Base URL e a conectividade da rede.",
    };
  } else {
    console.error(`[WhatsappService] Axios setup error:`, error.message);
    if (error.code === "ENOTFOUND") {
      return {
        status: "error",
        code: "ENOTFOUND",
        message: `O endereço da API do WhatsApp não foi encontrado. Verifique se a Base URL está correta.`,
      };
    }
    return {
      status: "error",
      code: "SETUP_FAILED",
      message: `Erro ao preparar a requisição para a API do WhatsApp: ${error.message}`,
    };
  }
};

const getInstanceStatus = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName) return "not_created";
  try {
    const response = await axios.get(
      `${config.url}/instance/connectionState/${config.instanceName}`,
      getAxiosConfig(config),
    );
    // Log para depuração
    console.log("[WhatsappService] Resposta da API de status da instância:", JSON.stringify(response.data, null, 2));

    const instanceState = response.data?.instance?.state?.toLowerCase();
    const newStatus = (instanceState === 'connected' || instanceState === 'open') ? 'connected' : 'disconnected';

    if (config.instanceStatus !== newStatus) {
      await config.update({ instanceStatus: newStatus });
    }
    return newStatus;
  } catch (error) {
    const errorStatus = handleAxiosError(
      error,
      tenantId,
      config.instanceName,
      true,
    );
    if (errorStatus.status === "not_created") {
      await config.update({
        instanceStatus: "not_created",
        instanceName: null,
      });
    }
    return errorStatus.status;
  }
};

const getConnectionInfo = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName) return { error: "unconfigured" };
  try {
    const response = await axios.get(
      `${config.url}/instance/fetchInstance/${config.instanceName}`,
      getAxiosConfig(config),
    );
    return response.data;
  } catch (error) {
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const createRemoteInstance = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.url || !config.apiKey) {
    throw new Error(
      "URL ou API Key do WhatsApp não configuradas para este tenant.",
    );
  }
  if (!config.instanceName) {
    const tenant = await Tenant.findByPk(tenantId);
    const newInstanceName = tenant.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    await config.update({ instanceName: newInstanceName });
    await config.reload();
  }
  try {
    const webhookUrl = `${process.env.BACKEND_URL}/whatsapp-webhook/webhook`;
    const instanceApiKey =
      config.instanceApiKey || crypto.randomBytes(16).toString("hex");
    if (!config.instanceApiKey) {
      await config.update({ instanceApiKey });
    }

    const payload = {
      instanceName: config.instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
      webhook: {
        url: webhookUrl,
        enabled: true,
        events: ["QRCODE_UPDATED", "CONNECTION_UPDATE", "MESSAGES_UPSERT"],
        headers: {
          "x-api-key": instanceApiKey,
        },
      },
    };

    const response = await axios.post(
      `${config.url}/instance/create`,
      payload,
      getAxiosConfig(config),
    );

    const responseApiKey = response.data.hash || response.data.apikey;
    if (responseApiKey && responseApiKey !== instanceApiKey) {
      await config.update({ instanceApiKey: responseApiKey });
    }

    return response.data;
  } catch (error) {
    const apiResponse = error.response?.data?.response;
    const apiMessage = Array.isArray(apiResponse?.message)
      ? apiResponse.message[0]
      : "";
    if (
      (error.response?.status === 403 &&
        apiMessage.includes("is already in use")) ||
      error.response?.data?.message === "Instance already exists"
    ) {
      return {
        status: "success",
        code: "INSTANCE_EXISTS",
        message: "Instância já existe.",
      };
    }
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const getQrCodeForConnect = async (tenantId) => {
  // Primeiro, tenta fazer logout para garantir uma sessão limpa.
  try {
    await logoutInstance(tenantId);
    // Pausa para dar tempo à API para processar o logout
    await new Promise((resolve) => setTimeout(resolve, 1500));
  } catch (error) {
    // Se o logout falhar (por exemplo, se já estiver desconectado), apenas registramos e continuamos.
    console.warn(
      `[WhatsappService] Non-critical error during pre-emptive logout for tenant ${tenantId}. It might have been already disconnected. Proceeding to get new QR code.`,
      error.message,
    );
  }

  const createResult = await createRemoteInstance(tenantId);
  if (
    createResult &&
    createResult.status === "error" &&
    createResult.code !== "INSTANCE_EXISTS"
  ) {
    return createResult;
  }

  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config) {
    throw new Error(
      `Configuration for tenant ${tenantId} not found after create/check.`,
    );
  }

  try {
    const response = await axios.get(
      `${config.url}/instance/connect/${config.instanceName}`,
      getAxiosConfig(config),
    );
    return response.data;
  } catch (error) {
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const restartInstance = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName)
    return { message: "Instância não configurada." };
  try {
    const response = await axios.put(
      `${config.url}/instance/restart/${config.instanceName}`,
      {},
      getAxiosConfig(config),
    );
    return response.data;
  } catch (error) {
    return handleAxiosError(error, tenantId, config.instanceName);
  }
};

const logoutInstance = async (tenantId) => {
  const config = await WhatsappConfig.findOne({ where: { tenantId } });
  if (!config || !config.instanceName)
    return { message: "Instância já desconectada ou não configurada." };
  try {
    const response = await axios.delete(
      `${config.url}/instance/logout/${config.instanceName}`,
      getAxiosConfig(config),
    );
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
    await axios.delete(
      `${config.url}/instance/delete/${config.instanceName}`,
      getAxiosConfig(config),
    );
    await whatsappConfigRepository.deleteByTenantId(tenantId);
    return { message: "Instância deletada com sucesso." };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      await whatsappConfigRepository.deleteByTenantId(tenantId);
      return {
        message:
          "Instância não encontrada na API do WhatsApp, removida do sistema.",
      };
    }
    throw error;
  }
};

// --- NEW METHODS FOR SENDER POOL INSTANCE MANAGEMENT ---

const getSenderInstanceStatus = async (sender) => {
  if (!sender || !sender.instanceName) return "not_created";
  try {
    const response = await axios.get(
      `${sender.apiUrl}/instance/connectionState/${sender.instanceName}`,
      { headers: { apikey: sender.apiKey } },
    );
    const newStatus =
      response.data.instance.state === "CONNECTED" ||
      response.data.instance.state === "open"
        ? "active"
        : "disconnected";
    if (sender.status !== newStatus) {
      await sender.update({ status: newStatus });
    }
    return newStatus;
  } catch (error) {
    // Using a generic error handler as we don't have a tenantId
    console.error(
      `[WhatsappService] Error getting status for sender ${sender.name}:`,
      error.message,
    );
    if (sender.status !== "disconnected") {
      await sender.update({ status: "disconnected" });
    }
    return "disconnected";
  }
};

const createSenderRemoteInstance = async (sender) => {
  if (!sender || !sender.apiUrl || !sender.apiKey || !sender.instanceName) {
    throw new Error(
      "Dados do disparador incompletos para criar instância remota.",
    );
  }

  try {
    const webhookUrl = `${process.env.BACKEND_URL}/superadmin/senders/webhook`;
    const payload = {
      instanceName: sender.instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
      webhook: {
        url: webhookUrl,
        enabled: true,
        events: ["QRCODE_UPDATED", "CONNECTION_UPDATE"],
        headers: {
          "x-api-key": process.env.WHATSAPP_API_KEY,
        },
      },
    };

    await axios.post(`${sender.apiUrl}/instance/create`, payload, {
      headers: { apikey: sender.apiKey },
    });
    return { status: "success", message: "Instância criada ou já existente." };
  } catch (error) {
    const apiResponse = error.response?.data?.response;
    const apiMessage = Array.isArray(apiResponse?.message)
      ? apiResponse.message[0]
      : "";
    if (
      (error.response?.status === 403 &&
        apiMessage.includes("is already in use")) ||
      error.response?.data?.message === "Instance already exists"
    ) {
      return {
        status: "success",
        code: "INSTANCE_EXISTS",
        message: "Instância já existe.",
      };
    }
    console.error(
      `[WhatsappService] Error creating remote instance for sender ${sender.name}:`,
      error.message,
    );
    throw error;
  }
};

const getSenderQrCodeForConnect = async (sender) => {
  const createResult = await createSenderRemoteInstance(sender);
  if (
    createResult &&
    createResult.status === "success" &&
    createResult.code === "INSTANCE_EXISTS"
  ) {
    // If instance already exists, check its connection status
    const currentStatus = await getSenderInstanceStatus(sender);
    if (currentStatus === "active") {
      // If already active, no QR code needed
      return { qrCode: "" };
    }
    // If not active, proceed to get QR code
  }
  try {
    const response = await axios.get(
      `${sender.apiUrl}/instance/connect/${sender.instanceName}`,
      { headers: { apikey: sender.apiKey } },
    );
    return response.data;
  } catch (error) {
    console.error(
      `[WhatsappService] Error getting QR code for sender ${sender.name}:`,
      error.message,
    );
    throw error;
  }
};

const deleteSenderInstance = async (sender) => {
  if (!sender || !sender.instanceName) {
    return {
      message: "Instância do disparador já removida ou não configurada.",
    };
  }

  try {
    await axios.delete(
      `${sender.apiUrl}/instance/delete/${sender.instanceName}`,
      { headers: { apikey: sender.apiKey } },
    );
    return { message: "Instância do disparador deletada com sucesso." };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return {
        message:
          "Instância do disparador não encontrada na API do WhatsApp, pode ser removida do sistema.",
      };
    }
    throw error;
  }
};

const getAllInstanceStatuses = async () => {
  // 1. Busca todos os tenants e todas as configurações
  const allTenants = await tenantRepository.getTenants();
  const allConfigs = await WhatsappConfig.findAll({
    include: [{ model: Tenant, as: "tenant", attributes: ["id", "name"] }],
  });

  // 2. Cria um mapa de configurações para facilitar a busca
  const configsMap = new Map(allConfigs.map(config => [config.tenantId, config]));

  // 3. Itera sobre TODOS os tenants e monta a resposta
  const statuses = await Promise.all(
    allTenants.map(async (tenant) => {
      const config = configsMap.get(tenant.id);

      if (config) {
        // Se a configuração existe, busca o status real
        const status = await getInstanceStatus(tenant.id);
        return {
          ...config.get({ plain: true }),
          status,
        };
      } else {
        // Se não existe, cria um objeto placeholder
        return {
          tenantId: tenant.id,
          Tenant: {
            id: tenant.id,
            name: tenant.name,
          },
          status: 'unconfigured',
          url: null,
          apiKey: null,
        };
      }
    }),
  );

  return statuses;
};

const restartSenderInstance = async (sender) => {
  if (!sender || !sender.instanceName)
    return { message: "Instância do disparador não configurada." };
  try {
    const response = await axios.put(
      `${sender.apiUrl}/instance/restart/${sender.instanceName}`,
      {},
      { headers: { apikey: sender.apiKey } },
    );
    return response.data;
  } catch (error) {
    console.error(
      `[WhatsappService] Error restarting sender instance ${sender.name}:`,
      error.message,
    );
    throw error;
  }
};

const logoutSenderInstance = async (sender) => {
  if (!sender || !sender.instanceName)
    return {
      message: "Instância do disparador já desconectada ou não configurada.",
    };
  try {
    const response = await axios.delete(
      `${sender.apiUrl}/instance/logout/${sender.instanceName}`,
      { headers: { apikey: sender.apiKey } },
    );
    return response.data;
  } catch (error) {
    console.error(
      `[WhatsappService] Error logging out sender instance ${sender.name}:`,
      error.message,
    );
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
  getSenderInstanceStatus, // Export new method
  createSenderRemoteInstance, // Export new method
  getSenderQrCodeForConnect, // Export new method
  restartSenderInstance, // Export new method
  logoutSenderInstance, // Export new method
  deleteSenderInstance,
};
