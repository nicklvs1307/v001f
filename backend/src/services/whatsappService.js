// services/whatsappService.js

class WhatsappService {
  constructor() {
    // Em um cenário real, você inicializaria o cliente da API aqui
    // Ex: this.client = new Twilio(config.twilio.sid, config.twilio.token);
  }

  /**
   * Envia uma mensagem de WhatsApp.
   * @param {string} to - O número de telefone do destinatário (ex: 'whatsapp:+5511999998888')
   * @param {string} body - O conteúdo da mensagem.
   * @returns {Promise<void>}
   */
  async sendMessage(to, body) {
    // SIMULAÇÃO: Apenas imprime a mensagem no console.
    // Substitua pela lógica real de envio.
    console.log('----------------------------------');
    console.log(`Enviando WhatsApp para: ${to}`);
    console.log(`Mensagem: ${body}`);
    console.log('----------------------------------');

    // Simula uma pequena demora de rede
    return new Promise(resolve => setTimeout(resolve, 50)); 
  }
}

module.exports = new WhatsappService();
