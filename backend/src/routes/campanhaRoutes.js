const express = require('express');
const CampanhaController = require('../controllers/campanhaController');
const { protect } = require('../middlewares/authMiddleware');
const createMulterConfig = require('../config/multerConfig');

const router = express.Router();
const campanhaController = new CampanhaController();
const upload = createMulterConfig('campaigns', 'media');

// Rotas protegidas por autenticação
router.use(protect);

router.post('/', upload, (req, res, next) => campanhaController.create(req, res, next));
router.get('/', (req, res, next) => campanhaController.getAll(req, res, next));
router.get('/:id', (req, res, next) => campanhaController.getById(req, res, next));
router.put('/:id', (req, res, next) => campanhaController.update(req, res, next));
router.delete('/:id', (req, res, next) => campanhaController.delete(req, res, next));

// Rota específica para iniciar o processamento
router.post('/:id/process', (req, res, next) => campanhaController.process(req, res, next));

// Rota para enviar um teste da campanha
router.post('/:id/test', (req, res, next) => campanhaController.sendTest(req, res, next));

module.exports = router;
