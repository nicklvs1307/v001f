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
  _prepareCampaignData(body, file) {
    const data = { ...body };

    // Parse JSON fields
    if (data.mensagens && typeof data.mensagens === 'string') {
      data.mensagens = JSON.parse(data.mensagens);
    }
    if (data.criterioSelecao && typeof data.criterioSelecao === 'string') {
      data.criterioSelecao = JSON.parse(data.criterioSelecao);
    }

    // Handle nullish or invalid dates
    ['startDate', 'endDate', 'dataValidade'].forEach(dateField => {
      const dateValue = data[dateField];
      if (dateValue === 'null' || dateValue === 'undefined' || dateValue === '' || new Date(dateValue).toString() === 'Invalid Date') {
        data[dateField] = null;
      }
    });
    
    // Handle nullish reward IDs
    ['recompensaId', 'roletaId'].forEach(idField => {
        if (data[idField] === 'null' || data[idField] === 'undefined' || data[idField] === '') {
            data[idField] = null;
        }
    });

    // Add mediaUrl if a file was uploaded
    if (file) {
      data.mediaUrl = `/uploads/campaigns/${file.filename}`;
    }

    return data;
  }

  async create(req, res, next) {
    try {
      const { tenantId } = req.user;
      const campaignData = this._prepareCampaignData(req.body, req.file);
      const campanha = await campanhaService.create({ ...campaignData, tenantId });
      res.status(201).json(campanha);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { tenantId } = req.user;
      const { status } = req.query; // Captura o parâmetro de status da query
      const campanhas = await campanhaService.getAll(tenantId, status);
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
      const campaignData = this._prepareCampaignData(req.body, req.file);
      const campanha = await campanhaService.update(id, campaignData, tenantId);
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

  async sendTest(req, res, next) {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;
      const { testPhoneNumber } = req.body;
      const result = await campanhaService.sendTest(id, tenantId, testPhoneNumber);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getLogs(req, res, next) {
    try {
      const { id } = req.params;
      const logs = await campanhaService.getCampaignLogs(id);
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CampanhaController;