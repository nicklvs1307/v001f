const express = require('express');
const router = express.Router();
const { check } = require("express-validator");
const atendenteController = require('../controllers/atendenteController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validationMiddleware");

// Todas as rotas de atendentes exigem autenticação
router.use(protect);

// Rotas para Atendentes
router.post(
  '/',
  [
    check("name", "Nome do atendente é obrigatório").not().isEmpty(),
    check("email", "Email do atendente inválido").optional().isEmail(),
    check("phone", "Telefone do atendente deve ser uma string não vazia").optional().not().isEmpty(),
  ],
  validate,
  authorize('atendentes:create'),
  atendenteController.createAtendente
);
router.get('/', authorize('atendentes:read'), atendenteController.getAllAtendentes);

router
  .route('/:id')
  .get(
    [
      check("id", "ID do atendente inválido").isUUID().not().isEmpty(),
    ],
    validate,
    authorize('atendentes:read'),
    atendenteController.getAtendenteById
  )
  .put(
    [
      check("id", "ID do atendente inválido").isUUID().not().isEmpty(),
      check("name", "Nome do atendente deve ser uma string não vazia").optional().not().isEmpty(),
      check("email", "Email do atendente inválido").optional().isEmail(),
      check("phone", "Telefone do atendente deve ser uma string não vazia").optional().not().isEmpty(),
    ],
    validate,
    authorize('atendentes:update'),
    atendenteController.updateAtendente
  )
  .delete(
    [
      check("id", "ID do atendente inválido").isUUID().not().isEmpty(),
    ],
    validate,
    authorize('atendentes:delete'),
    atendenteController.deleteAtendente
  );

module.exports = router;
