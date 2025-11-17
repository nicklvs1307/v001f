const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
  getClientDetails,
  ...clientController
} = require("../controllers/clientController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".csv"];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only .xlsx and .csv are allowed."));
    }
  },
});

// Validador reutilizável para data de nascimento
const birthDateValidator = check("birthDate", "Data de nascimento inválida")
  .optional({ checkFalsy: true })
  .customSanitizer((value) => {
    if (!value || value === "") return null;
    const parts = value.split("/");
    if (parts.length === 3 && parts[2].length === 4) {
      const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(date.getTime())) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return null;
  })
  .if(check("birthDate").notEmpty())
  .isISO8601()
  .withMessage("A data de nascimento deve estar no formato DD/MM/AAAA.");

// Rota pública para auto-cadastro de cliente após pesquisa
router.post(
  "/register",
  [
    check("name", "Nome do cliente é obrigatório").not().isEmpty(),
    check("email", "Email do cliente inválido").optional().isEmail(),
    check("phone", "Telefone do cliente é obrigatório").not().isEmpty(),
    birthDateValidator, // Usa o validador reutilizável
    check("respondentSessionId", "ID da sessão de resposta é obrigatório")
      .not()
      .isEmpty()
      .isUUID(),
  ],
  validate,
  clientController.publicRegisterClient,
);

// Rotas para o dashboard de clientes
router.get(
  "/dashboard",
  protect,
  authorize(["Admin"]),
  clientController.getClientDashboard,
);

// Rotas para clientes aniversariantes
router.get(
  "/birthdays",
  protect,
  authorize(["Admin"]),
  clientController.getBirthdayClients,
);

// Rotas CRUD para clientes
router
  .route("/")
  .post(
    protect,
    authorize(["Admin"]),
    [
      check("name", "Nome do cliente é obrigatório").not().isEmpty(),
      check("email", "Email do cliente inválido").optional().isEmail(),
      check("phone", "Telefone do cliente é obrigatório").not().isEmpty(),
      birthDateValidator, // Usa o validador reutilizável
      check("respondentSessionId", "ID da sessão do respondente inválido")
        .optional({ nullable: true })
        .isUUID(),
    ],
    validate,
    clientController.createClient,
  )
  .get(protect, authorize(["Admin"]), clientController.getAllClients);

router
  .route("/:id")
  .get(
    protect,
    authorize(["Admin"]),
    [check("id", "ID do cliente inválido").isUUID().not().isEmpty()],
    validate,
    clientController.getClientById,
  );

router
  .route("/:id/details")
  .get(
    protect,
    authorize(["Admin"]),
    [check("id", "ID do cliente inválido").isUUID().not().isEmpty()],
    validate,
    getClientDetails,
  );

router
  .route("/:id")
  .put(
    protect,
    authorize(["Admin"]),
    [
      check("id", "ID do cliente inválido").isUUID().not().isEmpty(),
      check("name", "Nome do cliente deve ser uma string não vazia")
        .optional()
        .not()
        .isEmpty(),
      check("email", "Email do cliente inválido").optional().isEmail(),
      check("phone", "Telefone do cliente deve ser uma string não vazia")
        .optional()
        .not()
        .isEmpty(),
      birthDateValidator, // Usa o validador reutilizável
      check("respondentSessionId", "ID da sessão do respondente inválido")
        .optional({ nullable: true })
        .isUUID(),
    ],
    validate,
    clientController.updateClient,
  )
  .delete(
    protect,
    authorize(["Admin"]),
    [check("id", "ID do cliente inválido").isUUID().not().isEmpty()],
    validate,
    clientController.deleteClient,
  );

// Rota para enviar mensagem de WhatsApp
router.post(
  "/:id/send-message",
  protect,
  authorize(["Admin"]),
  [
    check("id", "ID do cliente inválido").isUUID(),
    check("message", "A mensagem é obrigatória").not().isEmpty(),
  ],
  validate,
  clientController.sendMessageToClient,
);

router.post(
  "/import",
  protect,
  authorize(["Admin"]),
  upload.single("file"),
  clientController.importClients,
);

module.exports = router;
