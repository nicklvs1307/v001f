const asyncHandler = require('express-async-handler');
const aiService = require('../services/aiService');
const ApiError = require('../errors/ApiError');

class AiController {
  generateVariations = asyncHandler(async (req, res) => {
    const { baseMessage, numVariations } = req.body;

    if (!baseMessage) {
      throw new ApiError(400, 'A mensagem base é obrigatória.');
    }

    const spintaxResult = await aiService.generateMessageVariations(baseMessage, numVariations);

    res.status(200).json({ spintax: spintaxResult });
  });
}

module.exports = new AiController();
