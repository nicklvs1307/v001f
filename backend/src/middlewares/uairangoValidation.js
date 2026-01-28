const { check, validationResult } = require("express-validator");
const ApiError = require("../errors/ApiError");

const validateUaiRangoWebhook = [
  check("id_estabelecimento")
    .notEmpty()
    .withMessage("ID do estabelecimento é obrigatório."),
  check("cod_pedido").notEmpty().withMessage("Código do pedido é obrigatório."),
  check("usuario.nome")
    .notEmpty()
    .withMessage("Nome do cliente é obrigatório."),
  check("usuario.tel1")
    .notEmpty()
    .withMessage("Celular do cliente é obrigatório."),
  check("valor_total")
    .isFloat({ gt: 0 })
    .withMessage("Valor total deve ser um número positivo."),
  check("data").notEmpty().withMessage("Data do pedido é obrigatória."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("[UaiRango Webhook] Erro de validação:", errors.array());
      // A resposta ao Uai Rango já foi enviada, então apenas logamos o erro.
      // Em um cenário ideal, poderíamos notificar um administrador.
    }
    next();
  },
];

module.exports = validateUaiRangoWebhook;
