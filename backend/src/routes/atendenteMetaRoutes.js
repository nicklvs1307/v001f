const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const atendenteMetaController = require("../controllers/atendenteMetaController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

// Todas as rotas de metas de atendentes exigem autenticação
router.use(protect);

// Rotas para Metas de Atendentes
router.post(
  "/:atendenteId/metas",
  [
    check("atendenteId", "ID do atendente inválido").isUUID().not().isEmpty(),
    check("npsGoal", "Meta de NPS deve ser um número entre 0 e 100")
      .optional()
      .isFloat({ min: 0, max: 100 }),
    check(
      "responsesGoal",
      "Meta de Respostas deve ser um número inteiro maior ou igual a 0",
    )
      .optional()
      .isInt({ min: 0 }),
    check(
      "registrationsGoal",
      "Meta de Cadastros deve ser um número inteiro maior ou igual a 0",
    )
      .optional()
      .isInt({ min: 0 }),
  ],
  validate,
  authorize(["Admin", "Super Admin"]),
  atendenteMetaController.createOrUpdateMeta,
);
router.get(
  "/:atendenteId/metas",
  [check("atendenteId", "ID do atendente inválido").isUUID().not().isEmpty()],
  validate,
  authorize(["Admin", "Super Admin"]),
  atendenteMetaController.getMetaByAtendenteId,
);
router.get(
  "/metas",
  authorize(["Admin", "Super Admin"]),
  atendenteMetaController.getAllMetasByTenant,
);
router.delete(
  "/:atendenteId/metas",
  [check("atendenteId", "ID do atendente inválido").isUUID().not().isEmpty()],
  validate,
  authorize(["Admin", "Super Admin"]),
  atendenteMetaController.deleteMeta,
);

module.exports = router;
