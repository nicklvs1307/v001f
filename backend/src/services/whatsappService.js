const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const { SYSTEM_WHATSAPP_URL, SYSTEM_WHATSAPP_API_KEY, SYSTEM_WHATSAPP_INSTANCE } = process.env;

const sendSystemMessage = async (number, message) => {
  if (!SYSTEM_WHATSAPP_URL || !SYSTEM_WHATSAPP_API_KEY || !SYSTEM_WHATSAPP_INSTANCE) {
    console.error('Variáveis de ambiente do WhatsApp do sistema não configuradas.');
    // Em um cenário real, você poderia lançar um erro ou usar um sistema de notificação de falhas.
    return;
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

    console.log(`Mensagem enviada para ${number}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Falha ao enviar mensagem para ${number}:`, error.response ? error.response.data : error.message);
    // Lançar o erro permite que o chamador (ex: o job) saiba que o envio falhou.
    throw error;
  }
};

const sendInstanteDetractorMessage = async (tenant, detractorResponse) => {
    if (!tenant.reportPhoneNumber) {
        return; // Não faz nada se o tenant não tiver um número para relatórios
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


module.exports = {
  sendSystemMessage,
  sendInstanteDetractorMessage,
};