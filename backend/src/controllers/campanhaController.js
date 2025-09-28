const campanhaRepository = require('../repositories/campanhaRepository');
const clientRepository = require('../repositories/clientRepository');
const cupomRepository = require('../repositories/cupomRepository');
const CampanhaService = require('../services/campanhaService');
const roletaSpinRepository = require('../repositories/roletaSpinRepository');
const whatsappService = require('../services/whatsappService');

// Instanciando apenas o Service, que é uma classe que recebe as dependências
const campanhaService = new CampanhaService(
  campanhaRepository,
  clientRepository,
  cupomRepository,
  roletaSpinRepository,
  whatsappService
);

class CampanhaController {
  async create(req, res, next) {
    try {
      const { tenantId } = req.user;
      const campanha = await campanhaService.create({ ...req.body, tenantId });
      res.status(201).json(campanha);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { tenantId } = req.user;
      const campanhas = await campanhaService.getAll(tenantId);
      res.status(200).json(campanhas);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;
      const campanha = await campanhaService.getById(id, tenantId);
      res.status(200).json(campanha);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;
      const campanha = await campanhaService.update(id, req.body, tenantId);
      res.status(200).json(campanha);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;
      await campanhaService.delete(id, tenantId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async process(req, res, next) {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;
      const result = await campanhaService.scheduleProcessing(id, tenantId);
      res.status(202).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CampanhaController;