const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Todas as rotas abaixo são protegidas e requerem autenticação.
router.use(protect);

// Rota para listar todos os papéis (roles)
router.route("/").get(authorize("users:read"), roleController.getAllRoles);

module.exports = router;
