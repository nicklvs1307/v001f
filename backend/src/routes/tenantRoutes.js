const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const tenantController = require("../controllers/tenantController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const createMulterConfig = require("../config/multerConfig");

const uploadLogoMiddleware = createMulterConfig("logos", "logo");

// Todas as rotas abaixo são protegidas e requerem autenticação.
router.use(protect);

// Rota para listar todos os tenants e criar um novo tenant.
router
  .route("/")
  .get(authorize("tenants:read"), tenantController.getTenants)
  .post(
    authorize("tenants:create"),
    [
      check(
        "name",
        "Nome do tenant é obrigatório e deve ter no mínimo 3 caracteres",
      )
        .isLength({ min: 3 })
        .not()
        .isEmpty(),
    ],
    validate,
    tenantController.createTenant,
  );

// Rota para obter o tenant do usuário logado
router.get("/me", authorize("tenants:read"), tenantController.getMe);
router.put("/me", authorize("tenants:update"), tenantController.updateMe);

// Rota para upload de logo de tenant
router.post(
  "/:id/upload-logo",
  authorize("tenants:update"), // Permissão para atualizar tenant
  uploadLogoMiddleware, // 'logo' é o nome do campo no formulário
  tenantController.uploadLogo,
);

// Rota para obter um tenant específico por ID.
router
  .route("/:id")
  .get(authorize("tenants:read"), tenantController.getTenantById)
  .put(
    authorize("tenants:update"),
    [
      check(
        "name",
        "Nome do tenant é obrigatório e deve ter no mínimo 3 caracteres",
      )
        .isLength({ min: 3 })
        .not()
        .isEmpty(),
    ],
    validate,
    tenantController.updateTenant,
  )
  .delete(authorize("tenants:delete"), tenantController.deleteTenant);

module.exports = router;
