const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const createMulterConfig = require("../config/multerConfig");

const uploadProfilePictureMiddleware = createMulterConfig(
  "profile-pictures",
  "profilePicture",
);

// Todas as rotas abaixo são protegidas e requerem autenticação.
router.use(protect);

// Rotas para listar e criar usuários
router
  .route("/")
  .get(authorize("users:read"), userController.getUsers)
  .post(
    authorize("users:create"),
    [
      check("name", "Nome é obrigatório").not().isEmpty(),
      check("email", "Por favor, inclua um email válido").isEmail(),
      check(
        "password",
        "Por favor, insira uma senha com 6 ou mais caracteres",
      ).isLength({ min: 6 }),
      check("roleId", "O ID do papel é obrigatório").not().isEmpty(),
      check("tenantId", "O ID do tenant é obrigatório").not().isEmpty(),
    ],
    validate,
    userController.createUser,
  );

// Rota para upload de foto de perfil de usuário
router.post(
  "/:id/upload-profile-picture",
  authorize("users:update"), // Permissão para atualizar usuário
  uploadProfilePictureMiddleware, // 'profilePicture' é o nome do campo no formulário
  userController.uploadProfilePicture,
);

// Rotas para obter, atualizar e deletar um usuário específico
router
  .route("/:id")
  .get(authorize("users:read"), userController.getUserById)
  .put(
    authorize("users:update"),
    [
      check("name", "Nome é obrigatório").optional().not().isEmpty(),
      check("email", "Por favor, inclua um email válido").optional().isEmail(),
      check("password", "Por favor, insira uma senha com 6 ou mais caracteres")
        .optional()
        .isLength({ min: 6 }),
      check("roleId", "O ID do papel é obrigatório").optional().not().isEmpty(),
      check("tenantId", "O ID do tenant é obrigatório")
        .optional()
        .not()
        .isEmpty(),
    ],
    validate,
    userController.updateUser,
  )
  .delete(authorize("users:delete"), userController.deleteUser);

module.exports = router;
