const { validationResult } = require("express-validator");
const ApiError = require("../errors/ApiError");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Erros de validação", errors.array());
  }
  next();
};

module.exports = validate;
