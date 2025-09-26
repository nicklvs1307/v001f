const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const validate = require("../middlewares/validationMiddleware");
const { protect } = require("../middlewares/authMiddleware");

// Rota para registrar o primeiro Super Admin
router.post(
  "/register-super-admin",
  [
    check("name", "Nome é obrigatório").not().isEmpty(),
    check("email", "Por favor, inclua um email válido").isEmail(),
    check(
      "password",
      "Por favor, insira uma senha com 6 ou mais caracteres"
    ).isLength({ min: 6 }),
  ],
  validate,
  authController.registerSuperAdmin
);

// Rota de login para todos os usuários
router.post(
  "/login",
  [
    check("email", "Por favor, inclua um email válido").isEmail(),
    check("password", "Senha é obrigatória").not().isEmpty(),
  ],
  validate,
  authController.login
);

// Rota para verificar o token
router.post("/verify-token", authController.verifyToken);

module.exports = router;
