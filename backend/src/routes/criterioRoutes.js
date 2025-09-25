const express = require('express');
const { check } = require("express-validator");
const criterioController = require('../controllers/criterioController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validationMiddleware");

const router = express.Router();

// Todas as rotas de critérios exigem autenticação
router.use(protect);

router.post(
  "/",
  [
    check("name", "Nome do critério é obrigatório").not().isEmpty(),
    check("description", "Descrição do critério deve ser uma string").optional().isString(),
  ],
  validate,
  authorize("criterios:create"),
  criterioController.createCriterio
);
router.get("/", authorize("criterios:read"), criterioController.getAllCriterios);

router
  .route("/:id")
  .get(
    [
      check("id", "ID do critério inválido").isUUID().not().isEmpty(),
    ],
    validate,
    authorize("criterios:read"),
    criterioController.getCriterioById
  )
  .put(
    [
      check("id", "ID do critério inválido").isUUID().not().isEmpty(),
      check("name", "Nome do critério deve ser uma string não vazia").optional().not().isEmpty(),
      check("description", "Descrição do critério deve ser uma string").optional().isString(),
    ],
    validate,
    authorize("criterios:update"),
    criterioController.updateCriterio
  )
  .delete(
    [
      check("id", "ID do critério inválido").isUUID().not().isEmpty(),
    ],
    validate,
    authorize("criterios:delete"),
    criterioController.deleteCriterio
  );

module.exports = router;
