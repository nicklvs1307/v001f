const { validationResult } = require("express-validator");
// Não usamos mais ApiError aqui para ter controle total sobre o formato do JSON de validação
// ou podemos adaptar para retornar um formato que o frontend espera.

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Transforma o array de erros em um objeto { campo: mensagem }
    const formattedErrors = {};
    errors.array().forEach((error) => {
      // Se houver múltiplos erros para o mesmo campo, o último prevalece (ou o primeiro, dependendo da preferência)
      // Aqui vamos pegar o primeiro erro encontrado para cada campo
      if (!formattedErrors[error.path]) {
        formattedErrors[error.path] = error.msg;
      }
    });

    return res.status(400).json({
      status: "fail", // fail para erros de validação (client-side), error para erros de servidor
      message: "Por favor, corrija os erros abaixo.",
      errors: formattedErrors, // Objeto { email: "Email inválido", ... }
    });
  }
  next();
};

module.exports = validate;