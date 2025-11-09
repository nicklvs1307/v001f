const { Op } = require('sequelize');
const ApiError = require('../errors/ApiError');
const { scheduleCampaign, cancelCampaign } = require('../jobs/campaignScheduler');
const { CampanhaLog, Client } = require('../../models');
const senderPoolService = require('./senderPoolService'); // Import the new service

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
    return this.campanhaRepository.create(data);
  }

  async getAll(tenantId, statusFilter = null) {
    const whereClause = { tenantId };
    if (statusFilter) {
      whereClause.status = statusFilter;
    }
    return this.campanhaRepository.findAll(whereClause);
  }

  async getById(id, tenantId) {
    return this.campanhaRepository.findById(id, tenantId, { include: ['recompensa'] });
  }

  async update(id, data, tenantId) {
    const updatedCampaign = await this.campanhaRepository.update(id, data, tenantId);
    const campaign = await this.getById(id, tenantId);
    
    if (campaign.status === 'scheduled' && campaign.startDate) {
      scheduleCampaign(campaign, this._processCampaign.bind(this));
    } else {
      cancelCampaign(id);
    }
    
    return updatedCampaign;
  }

  async delete(id, tenantId) {
    cancelCampaign(id);
    return this.campanhaRepository.delete(id, tenantId);
  }

  async scheduleProcessing(id, tenantId) {
    const campanha = await this.getById(id, tenantId);
    if (['processing', 'sent'].includes(campanha.status)) {
      throw ApiError.badRequest('Esta campanha já foi processada ou está em processamento.');
    }

    if (campanha.startDate && new Date(campanha.startDate) > new Date()) {
      await this.campanhaRepository.update(id, { status: 'scheduled' }, tenantId);
      const updatedCampanha = await this.getById(id, tenantId);
      scheduleCampaign(updatedCampanha, this._processCampaign.bind(this));
      return { message: `Campanha agendada para ${new Date(campanha.startDate).toLocaleString()}` };
    }

    this._processCampaign(id, tenantId).catch(err => {
        console.error(`[Campanha] Falha crítica no processamento da campanha ${id}:`, err);
        this.campanhaRepository.update(id, { status: 'failed' }, tenantId);
    });

    return { message: 'Campanha enviada para processamento imediato.' };
  }
  
  async cancelScheduling(id, tenantId) {
    cancelCampaign(id);
    return this.campanhaRepository.update(id, { status: 'draft' }, tenantId);
  }

  // Test sends will still use the tenant's connection for simplicity
  async sendTest(id, tenantId, testPhoneNumber) {
    const campanha = await this.getById(id, tenantId);
    const fakeClient = { name: 'Cliente Teste', phone: testPhoneNumber };
    let rewardCode = '[CODIGO_TESTE]';

    if (campanha.rewardType === 'ROLETA') {
      const roletaBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      rewardCode = `${roletaBaseUrl}/roleta/spin/[TOKEN_TESTE]`;
    }

    const messageTemplate = campanha.mensagens[0] || '';
    const personalizedMessage = this._buildPersonalizedMessage(messageTemplate, fakeClient, {
      codigo: rewardCode,
      dataValidade: campanha.dataValidade,
      nomeRecompensa: campanha.recompensa ? campanha.recompensa.nome : '[RECOMPENSA_TESTE]',
      nomeCampanha: campanha.nome,
    });

    if (campanha.mediaUrl) {
      await this.whatsappService.sendTenantMediaMessage(tenantId, testPhoneNumber, campanha.mediaUrl, personalizedMessage);
    } else {
      await this.whatsappService.sendTenantMessage(tenantId, testPhoneNumber, personalizedMessage);
    }

    return { message: `Mensagem de teste enviada para ${testPhoneNumber}` };
  }

  _buildPersonalizedMessage(template, client, rewardData = {}) {
    let message = template.replace(/{{nome_cliente}}/g, client.name.split(' ')[0]);
    if (rewardData.codigo) message = message.replace(/{{codigo_premio}}/g, rewardData.codigo);
    if (rewardData.dataValidade) {
      const formattedDate = new Date(rewardData.dataValidade).toLocaleDateString('pt-BR');
      message = message.replace(/{{data_validade}}/g, formattedDate);
    }
    if (rewardData.nomeRecompensa) message = message.replace(/{{nome_recompensa}}/g, rewardData.nomeRecompensa);
    if (rewardData.nomeCampanha) message = message.replace(/{{nome_campanha}}/g, rewardData.nomeCampanha);
    return message;
  }

  async _processCampaign(campaignId, tenantId) {
    try {
        await this.campanhaRepository.update(campaignId, { status: 'processing' }, tenantId);
        const campanha = await this.getById(campaignId, tenantId);

        const clients = await this._selectClients(campanha.criterioSelecao, tenantId);
        if (!clients || clients.length === 0) {
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
    } catch (err) {
        console.error(`[Campanha] Falha no processamento da campanha ${campaignId}:`, err);
        this.campanhaRepository.update(campaignId, { status: 'failed' }, tenantId).catch(console.error);
    }
  }

  async _selectClients(criterio, tenantId) {
    // ... (existing logic)
  }

  async _generateRewards(campanha, clients) {
    // ... (existing logic)
  }

  _getRandomDelay(min, max) {
    if (min === 0 && max === 0) return 0;
    return (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
  }

  async _sendMessageWithPool(campanha, client, personalizedMessage, maxRetries = 2) {
    let attempts = 0;
    while (attempts < maxRetries) {
      let sender;
      try {
        sender = await senderPoolService.getAvailableSender();
        const delay = this._getRandomDelay(campanha.minMessageDelaySeconds, campanha.maxMessageDelaySeconds);

        if (campanha.mediaUrl) {
          await this.whatsappService.sendCampaignMediaMessage(sender, client.phone, campanha.mediaUrl, personalizedMessage, delay);
        } else {
          await this.whatsappService.sendCampaignMessage(sender, client.phone, personalizedMessage, delay);
        }
        
        await senderPoolService.recordSuccessfulSend(sender.id);
        return { status: 'sent', errorMessage: null }; // Success
      } catch (err) {
        attempts++;
        console.error(`[Campanha] Tentativa ${attempts} falhou para ${client.phone} com disparador ${sender?.name || 'N/A'}. Erro: ${err.message}`);
        if (sender) {
          await senderPoolService.reportFailedSender(sender.id, 'blocked');
        }
        if (attempts >= maxRetries) {
          return { status: 'failed', errorMessage: err.message }; // Final failure
        }
        // Wait a bit before retrying with a new sender
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async _sendSimpleMessages(campanha, clients) {
    for (const client of clients) {
      if (client && client.phone) {
        const messageTemplate = campanha.mensagens[Math.floor(Math.random() * campanha.mensagens.length)];
        const personalizedMessage = this._buildPersonalizedMessage(messageTemplate, client, {
          nomeCampanha: campanha.nome,
        });
        
        const { status, errorMessage } = await this._sendMessageWithPool(campanha, client, personalizedMessage);

        await CampanhaLog.create({
          campanhaId: campanha.id,
          clienteId: client.id,
          status: status,
          errorMessage: errorMessage,
        });
      }
    }
  }

  async _sendRewardMessages(campanha, clients, rewards) {
    const clientMap = new Map(clients.map(c => [c.id, c]));

    for (const reward of rewards) {
      const client = clientMap.get(reward.clienteId);
      if (client && client.phone) {
        const messageTemplate = campanha.mensagens[Math.floor(Math.random() * campanha.mensagens.length)];
        
        let rewardCode;
        if (campanha.rewardType === 'RECOMPENSA' && reward.codigo) {
          rewardCode = reward.codigo;
        } else if (campanha.rewardType === 'ROLETA' && reward.token) {
          const roletaBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          rewardCode = `${roletaBaseUrl}/roleta/spin/${reward.token}`;
        }

        const personalizedMessage = this._buildPersonalizedMessage(messageTemplate, client, {
          codigo: rewardCode,
          dataValidade: campanha.dataValidade,
          nomeRecompensa: campanha.recompensa ? campanha.recompensa.nome : '',
          nomeCampanha: campanha.nome,
        });

        const { status, errorMessage } = await this._sendMessageWithPool(campanha, client, personalizedMessage);

        await CampanhaLog.create({
          campanhaId: campanha.id,
          clienteId: client.id,
          status: status,
          errorMessage: errorMessage,
        });
      }
    }
  }

  async getCampaignLogs(campaignId) {
    return CampanhaLog.findAll({
      where: { campanhaId },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone'],
      }],
      order: [['sentAt', 'DESC']],
    });
  }
}

module.exports = CampanhaService;
