const { Op } = require('sequelize');
const ApiError = require('../errors/ApiError');
const { scheduleCampaign, cancelCampaign } = require('../jobs/campaignScheduler');

class CampanhaService {
  constructor(campanhaRepository, clientRepository, cupomRepository, roletaSpinRepository, whatsappService) {
    this.campanhaRepository = campanhaRepository;
    this.clientRepository = clientRepository;
    this.cupomRepository = cupomRepository;
    this.roletaSpinRepository = roletaSpinRepository;
    this.whatsappService = whatsappService;
  }

  async initScheduledCampaigns() {
    console.log('[CampanhaService] Inicializando campanhas agendadas...');
    const scheduledCampaigns = await this.campanhaRepository.findAllWhere({
      status: 'scheduled',
      startDate: { [Op.ne]: null },
    });

    for (const campaign of scheduledCampaigns) {
      scheduleCampaign(campaign, this._processCampaign.bind(this));
    }
    console.log(`[CampanhaService] ${scheduledCampaigns.length} campanhas reagendadas.`);
  }

  async create(data) {
    // ... (lógica existente)
    return this.campanhaRepository.create(data);
  }

  async getAll(tenantId) {
    return this.campanhaRepository.findAll(tenantId);
  }

  async getById(id, tenantId) {
    return this.campanhaRepository.findById(id, tenantId, { include: ['recompensa'] });
  }

  async update(id, data, tenantId) {
    const originalCampaign = await this.getById(id, tenantId);
    const updatedCampaign = await this.campanhaRepository.update(id, data, tenantId);

    // Se a data de agendamento mudou, reagende
    if (data.startDate && new Date(data.startDate) !== new Date(originalCampaign.startDate)) {
      if (updatedCampaign.status === 'scheduled') {
        scheduleCampaign(updatedCampaign, this._processCampaign.bind(this));
      }
    }
    return updatedCampaign;
  }

  async delete(id, tenantId) {
    cancelCampaign(id);
    return this.campanhaRepository.delete(id, tenantId);
  }

  async scheduleProcessing(id, tenantId) {
    const campanha = await this.getById(id, tenantId);
    if (['processing', 'sent', 'scheduled'].includes(campanha.status)) {
      throw ApiError.badRequest('Esta campanha já foi processada ou agendada.');
    }

    if (campanha.startDate && new Date(campanha.startDate) > new Date()) {
      await this.campanhaRepository.update(id, { status: 'scheduled' }, tenantId);
      const updatedCampaign = await this.getById(id, tenantId); // Pega a campanha atualizada
      scheduleCampaign(updatedCampaign, this._processCampaign.bind(this));
      return { message: 'Campanha agendada com sucesso.' };
    }

    // Processamento imediato
    this._processCampaign(id, tenantId).catch(err => {
        console.error(`[Campanha] Falha crítica no processamento da campanha ${id}:`, err);
        this.campanhaRepository.update(id, { status: 'failed' }, tenantId);
    });

    return { message: 'Campanha enviada para processamento imediato.' };
  }
  
  async cancelScheduling(id, tenantId) {
    const campaign = await this.getById(id, tenantId);
    if (campaign.status !== 'scheduled') {
      throw ApiError.badRequest('Apenas campanhas agendadas podem ser canceladas.');
    }
    cancelCampaign(id);
    return this.campanhaRepository.update(id, { status: 'draft' }, tenantId);
  }

  async sendTest(id, tenantId, testPhoneNumber) {
    // ... (lógica existente)
  }

  _getRandomDelay(min, max) {
    // ... (lógica existente)
  }

  _getRandomMessage(messages) {
    // ... (lógica existente)
  }

  _buildPersonalizedMessage(template, client, rewardData = {}) {
    // ... (lógica existente)
  }

  async _processCampaign(campaignId, tenantId) {
    try {
        await this.campanhaRepository.update(campaignId, { status: 'processing' }, tenantId);
        console.log(`[Campanha] Iniciando processamento para campanha ${campaignId}`);
        const campanha = await this.getById(campaignId, tenantId);

        if (campanha.rewardType === 'RECOMPENSA' && !campanha.recompensaId) {
            throw new Error('Campanha de recompensa não tem uma recompensa associada.');
        }

        const clients = await this._selectClients(campanha.criterioSelecao, tenantId);
        if (!clients || clients.length === 0) {
            console.log(`[Campanha] Nenhum cliente encontrado para os critérios da campanha ${campaignId}.`);
            await this.campanhaRepository.update(campaignId, { status: 'sent' }, tenantId);
            return;
        }

        if (campanha.rewardType === 'NONE') {
            await this._sendSimpleMessages(campanha, clients);
        } else {
            const rewards = await this._generateRewards(campanha, clients);
            await this._sendRewardMessages(campanha, clients, rewards);
        }

        await this.campanhaRepository.update(campaignId, { status: 'sent' }, tenantId);
        console.log(`[Campanha] Processamento da campanha ${campaignId} concluído com sucesso.`);
    } catch (err) {
        console.error(`[Campanha] Falha no processamento da campanha ${campaignId}:`, err);
        this.campanhaRepository.update(campaignId, { status: 'failed' }, tenantId).catch(console.error);
    }
  }

  async _selectClients(criterio, tenantId) {
    // ... (lógica existente)
  }

  async _generateRewards(campanha, clients) {
    // ... (lógica existente)
  }

  async _sendSimpleMessages(campanha, clients) {
    // ... (lógica existente)
  }

  async _sendRewardMessages(campanha, clients, rewards) {
    // ... (lógica existente)
  }
}

module.exports = CampanhaService;
