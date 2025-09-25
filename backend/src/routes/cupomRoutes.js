const express = require('express');
const router = express.Router();
const { check } = require("express-validator");
const cupomController = require('../controllers/cupomController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validationMiddleware");

// Todas as rotas de cupons exigem autenticação
router.use(protect);

// Rotas para Geração e Gestão de Cupons
router.post(
  '/generate',
  [
    check("recompensaId", "ID da recompensa é obrigatório").isUUID().not().isEmpty(),
    check("clientId", "ID do cliente inválido").optional().isUUID(),
    check("quantidade", "Quantidade deve ser um número inteiro maior que 0").optional().isInt({ gt: 0 }),
  ],
  validate,
  authorize('cupons:create'),
  cupomController.generateCupom
);
router.get('/', authorize('cupons:read'), cupomController.getAllCupons);
router.get('/summary', authorize('cupons:read'), cupomController.getCuponsSummary);

router
  .route('/:id')
  .get(
    [
      check("id", "ID do cupom inválido").isUUID().not().isEmpty(),
    ],
    validate,
    authorize('cupons:read'),
    cupomController.getCupomById
  );

// Rota para validação de cupom (pode ser acessada por um papel específico, como 'Validador de Cupom')
router.post(
  '/validate',
  [
    check("code", "Código do cupom é obrigatório").not().isEmpty(),
  ],
  validate,
  authorize('cupons:validate'),
  cupomController.validateCupom
);

module.exports = router;
