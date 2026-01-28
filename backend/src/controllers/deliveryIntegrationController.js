const asyncHandler = require("express-async-handler");
const deliveryIntegrationService = require("../services/deliveryIntegrationService");

const deliveryIntegrationController = {
  handleUaiRangoWebhook: asyncHandler(async (req, res) => {
    const payload = req.body;

    // Responder imediatamente para o Uai Rango não reenviar o webhook
    res.status(200).send("OK");

    // Processar o pedido em segundo plano
    setTimeout(() => {
      deliveryIntegrationService
        .processUaiRangoOrder(payload)
        .catch((error) => {
          console.error(
            "Erro assíncrono ao processar webhook do Uai Rango:",
            error,
          );
        });
    }, 0);
  }),
};

module.exports = deliveryIntegrationController;
