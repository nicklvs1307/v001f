const express = require('express');
const router = express.Router();
const { check } = require("express-validator");
const { getClientDetails, ...clientController } = require('../controllers/clientController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validationMiddleware");

// Rota pública para auto-cadastro de cliente após pesquisa
router.post(
  '/register',
  [
    check("name", "Nome do cliente é obrigatório").not().isEmpty(),
    check("email", "Email do cliente inválido").optional().isEmail(),
    check("phone", "Telefone do cliente é obrigatório").not().isEmpty(),
    check("birthDate", "Data de nascimento inválida").optional().isISO8601().toDate(),
    check("respondentSessionId", "ID da sessão do respondente inválido").optional().isUUID(),
  ],
  validate,
  clientController.publicRegisterClient
);

// Rotas para o dashboard de clientes
router.get('/dashboard', protect, authorize(['Admin']), clientController.getClientDashboard);

// Rotas para clientes aniversariantes
router.get('/birthdays', protect, authorize(['Admin']), clientController.getBirthdayClients);

// Rotas CRUD para clientes
router.route('/')
  .post(
    protect,
    authorize(['Admin']),
    [
      check("name", "Nome do cliente é obrigatório").not().isEmpty(),
      check("email", "Email do cliente inválido").optional().isEmail(),
      check("phone", "Telefone do cliente é obrigatório").not().isEmpty(),
      check("birthDate", "Data de nascimento inválida").optional().isISO8601().toDate(),
      check("respondentSessionId", "ID da sessão do respondente inválido").optional().isUUID(),
    ],
    validate,
    clientController.createClient
  )
  .get(protect, authorize(['Admin']), clientController.getAllClients);

router.route('/:id')
  .get(
    protect,
    authorize(['Admin']),
    [
      check("id", "ID do cliente inválido").isUUID().not().isEmpty(),
    ],
    validate,
    clientController.getClientById
  )

router.route('/:id/details')
  .get(
    protect,
    authorize(['Admin']),
    [
      check("id", "ID do cliente inválido").isUUID().not().isEmpty(),
    ],
    validate,
    getClientDetails
  )

router.route('/:id')
  .put(
    protect,
    authorize(['Admin']),
    [
      check("id", "ID do cliente inválido").isUUID().not().isEmpty(),
      check("name", "Nome do cliente deve ser uma string não vazia").optional().not().isEmpty(),
      check("email", "Email do cliente inválido").optional().isEmail(),
      check("phone", "Telefone do cliente deve ser uma string não vazia").optional().not().isEmpty(),
      check("birthDate", "Data de nascimento inválida").optional().isISO8601().toDate(),
      check("respondentSessionId", "ID da sessão do respondente inválido").optional().isUUID(),
    ],
    validate,
    clientController.updateClient
  )
  .delete(
    protect,
    authorize(['Admin']),
    [
      check("id", "ID do cliente inválido").isUUID().not().isEmpty(),
    ],
    validate,
    clientController.deleteClient
  );

// Rota para enviar mensagem de WhatsApp
router.post(
  '/:id/send-message',
  protect,
  authorize(['Admin']),
  [
    check("id", "ID do cliente inválido").isUUID(),
    check("message", "A mensagem é obrigatória").not().isEmpty(),
  ],
  validate,
  clientController.sendMessageToClient
);

module.exports = router;
