const asyncHandler = require("express-async-handler");
const aiService = require("../services/aiService");
const ApiError = require("../errors/ApiError");

class AiController {
  generateVariations = asyncHandler(async (req, res) => {
    const { baseMessage, numVariations } = req.body;

    if (!baseMessage) {
      throw new ApiError(400, "A mensagem base é obrigatória.");
    }

    const spintaxResult = await aiService.generateMessageVariations(
      baseMessage,
      numVariations,
    );

    res.status(200).json({ spintax: spintaxResult });
  });

  chat = asyncHandler(async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new ApiError(
        400,
        "O histórico de mensagens é obrigatório e deve ser um array.",
      );
    }

    const botResponse = await aiService.getChatCompletion(messages);

    res.status(200).json({ response: botResponse });
  });
}

module.exports = new AiController();
