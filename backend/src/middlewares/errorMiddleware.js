const config = require("../config");
const ApiError = require("../errors/ApiError"); // Importar ApiError

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Evita 200 OK para erros

  let message = "Ocorreu um erro inesperado no servidor. Por favor, tente novamente mais tarde.";
  let errorCode = null;
  let details = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
  } else {
    // Para erros não-ApiError, logar o erro completo para depuração
    console.error(err);
    // Em desenvolvimento, mostrar a mensagem original do erro
    if (config.nodeEnv !== "production") {
      message = err.message;
    }
  }

  // Em desenvolvimento, incluir o stack trace
  if (config.nodeEnv !== "production") {
    details = err.stack;
  }

  res.status(statusCode).json({
    status: "error",
    code: errorCode || `HTTP_${statusCode}`, // Usar errorCode ou um código genérico HTTP
    message: message,
    details: details,
  });
};

module.exports = {
  errorHandler,
};
