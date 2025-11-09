const ApiError = require('../errors/ApiError');

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.WHATSAPP_API_KEY) {
    throw new ApiError(401, 'Unauthorized: Invalid API Key');
  }
  next();
};

module.exports = apiKeyAuth;
