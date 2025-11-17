const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const recompensaController = require("../controllers/recompensaController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

// Todas as rotas de recompensas exigem autenticação
router.use(protect);

// Rotas para Recompensas
router.post(
  "/",
  [
    check("name", "Nome da recompensa é obrigatório").not().isEmpty(),
    check("description", "Descrição da recompensa deve ser uma string")
      .optional()
      .isString(),
    check(
      "pointsRequired",
      "Pontos necessários são obrigatórios e devem ser um número inteiro maior que 0",
    )
      .isInt({ gt: 0 })
      .not()
      .isEmpty(),
  ],
  validate,
  authorize("recompensas:create"),
  recompensaController.createRecompensa,
);
router.get(
  "/",
  authorize("recompensas:read"),
  recompensaController.getAllRecompensas,
);
router.get(
  "/dashboard",
  authorize("recompensas:read"),
  recompensaController.getDashboard,
);

router
  .route("/:id")
  .get(
    [check("id", "ID da recompensa inválido").isUUID().not().isEmpty()],
    validate,
    authorize("recompensas:read"),
    recompensaController.getRecompensaById,
  )
  .put(
    [
      check("id", "ID da recompensa inválido").isUUID().not().isEmpty(),
      check("name", "Nome da recompensa deve ser uma string não vazia")
        .optional()
        .not()
        .isEmpty(),
      check("description", "Descrição da recompensa deve ser uma string")
        .optional()
        .isString(),
      check(
        "pointsRequired",
        "Pontos necessários devem ser um número inteiro maior que 0",
      )
        .optional()
        .isInt({ gt: 0 }),
    ],
    validate,
    authorize("recompensas:update"),
    recompensaController.updateRecompensa,
  )
  .delete(
    [check("id", "ID da recompensa inválido").isUUID().not().isEmpty()],
    validate,
    authorize("recompensas:delete"),
    recompensaController.deleteRecompensa,
  );

module.exports = router;
