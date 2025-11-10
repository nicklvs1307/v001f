const OpenAI = require('openai');
const ApiError = require('../errors/ApiError');
const { readSecret } = require('../utils/secretReader');

const openai = new OpenAI({
  apiKey: readSecret('OPENAI_API_KEY'),
});

const AI_MODEL = 'gpt-3.5-turbo'; // Or a newer model if available/preferred

class AiService {
  /**
   * Generates message variations using OpenAI and formats them into a spintax string.
   * @param {string} baseMessage - The base message or idea from the user.
   * @param {number} numVariations - The number of variations to generate.
   * @returns {Promise<string>} A spintax string, e.g., "{Variation 1|Variation 2|Variation 3}"
   */
  async generateMessageVariations(baseMessage, numVariations = 3) {
    // A verificação da chave da API é feita dentro de readSecret, então esta linha pode ser removida.
    // if (!process.env.OPENAI_API_KEY) {
    //   throw new ApiError(500, 'A chave da API da OpenAI não está configurada no servidor.');
    // }

    const systemPrompt = `
      Você é um especialista em marketing para restaurantes e seu trabalho é criar mensagens de WhatsApp curtas, amigáveis e eficazes.
      Gere ${numVariations} variações da mensagem base fornecida pelo usuário.
      - As mensagens devem ser perfeitas para o WhatsApp: curtas, com emojis apropriados e um tom casual.
      - **Use formatação para destacar informações importantes, como negrito (usando asteriscos, ex: *texto em negrito*).**
      - **Utilize quebras de linha para melhorar a legibilidade e o espaçamento visual.**
      - Mantenha todos os placeholders intactos, como {{nome_cliente}}, {{codigo_premio}}, etc.
      - Responda APENAS com as variações, cada uma em uma nova linha. Não adicione introduções, despedidas ou qualquer outro texto.
      - Exemplo de resposta:
      Variação 1 aqui
      Variação 2 aqui
      Variação 3 aqui
    `;

    try {
      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: baseMessage },
        ],
        temperature: 0.7,
        max_tokens: 200,
        n: 1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('A resposta da IA estava vazia.');
      }

      // Split the response by newlines, trim whitespace, and filter out empty lines
      const variations = content.split('\n').map(v => v.trim()).filter(v => v);

      if (variations.length === 0) {
        throw new Error('A IA não gerou variações válidas.');
      }

      // Format into a spintax string
      const spintaxString = `{${variations.join('|')}}`;

      return spintaxString;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new ApiError(502, 'Falha ao se comunicar com o serviço de IA.');
    }
  }

  /**
   * Generates a response for the help chatbot.
   * @param {Array<object>} messages - The conversation history, e.g., [{ role: 'user', content: 'Hello' }]
   * @returns {Promise<string>} The bot's response message.
   */
  async getChatCompletion(messages) {
    const systemPrompt = `
      Você é o "VoltakiBot", um assistente virtual para o sistema de fidelização e marketing "Voltaki".
      Sua única função é responder a perguntas sobre como usar o sistema Voltaki, suas funcionalidades, e solucionar dúvidas comuns dos usuários.
      Seja claro, amigável e direto ao ponto.
      Se o usuário perguntar sobre qualquer outro assunto não relacionado ao Voltaki, recuse educadamente a resposta e reforce seu propósito.
      Exemplo de recusa: "Desculpe, eu sou um assistente focado no sistema Voltaki e não posso ajudar com outros assuntos."
      Não invente funcionalidades que não existem.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages, // Spread the incoming messages array
        ],
        temperature: 0.5,
        max_tokens: 500,
        n: 1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('A resposta da IA estava vazia.');
      }

      return content;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new ApiError(502, 'Falha ao se comunicar com o serviço de IA para o chat.');
    }
  }
}

module.exports = new AiService();
