const { Op } = require('sequelize');
const ApiError = require('../errors/ApiError');
const { scheduleCampaign, cancelCampaign } = require('../jobs/campaignScheduler');
const { CampanhaLog, Client, sequelize } = require('../../models');
const senderPoolService = require('./senderPoolService'); // Import the new service
const { Spinner } = require('cnc-spintax'); // Import spintax library

// Campaign Auto-Pause Control
const campaignFailureTracker = {}; // In-memory tracker for campaign failures
const FAILURE_WINDOW_SECONDS = 60;
const FAILURE_THRESHOLD = 5;

class PauseCampaignError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PauseCampaignError';
  }
}

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
    const scheduledCampaigns = await this.campanhaRepository.findAll({
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
      const extension = campanha.mediaUrl.split('.').pop().toLowerCase();
      const isAudio = ['mp3', 'ogg', 'wav', 'aac', 'mpeg'].includes(extension);
      if (isAudio) {
        await this.whatsappService.sendTenantAudioMessage(tenantId, testPhoneNumber, campanha.mediaUrl);
      } else {
        await this.whatsappService.sendTenantMediaMessage(tenantId, testPhoneNumber, campanha.mediaUrl, personalizedMessage);
      }
    } else {
      await this.whatsappService.sendTenantMessage(tenantId, testPhoneNumber, personalizedMessage);
    }

    return { message: `Mensagem de teste enviada para ${testPhoneNumber}` };
  }

  _buildPersonalizedMessage(template, client, rewardData = {}) {
    let message = new Spinner(template).unspinRandom(); // Process spintax first
    message = message.replace(/{{nome_cliente}}/g, client.name.split(' ')[0]);
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
    // Initialize failure tracker for this campaign run
    campaignFailureTracker[campaignId] = [];

    try {
      await this.campanhaRepository.update(campaignId, { status: 'processing' }, tenantId);
      const campanha = await this.getById(campaignId, tenantId);

      const clients = await this._selectClients(campanha.criterioSelecao, tenantId);
      if (!clients || clients.length === 0) {
        await this.campanhaRepository.update(campaignId, { status: 'sent' }, tenantId);
        return;
      }

      try {
        if (campanha.rewardType === 'NONE') {
          await this._sendSimpleMessages(campanha, clients);
        } else {
          const rewards = await this._generateRewards(campanha, clients);
          await this._sendRewardMessages(campanha, clients, rewards);
        }
        // If the loop completes without being paused, mark as sent
        await this.campanhaRepository.update(campaignId, { status: 'sent' }, tenantId);

      } catch (err) {
        if (err instanceof PauseCampaignError) {
          console.log(`[Campanha] Campanha ${campaignId} pausada devido a muitas falhas.`);
          // The status is already set to 'paused' by the function that throws this
        } else {
          // Re-throw other unexpected errors to be caught by the outer block
          throw err;
        }
      }
    } catch (err) {
      console.error(`[Campanha] Falha no processamento da campanha ${campaignId}:`, err);
      this.campanhaRepository.update(campaignId, { status: 'failed' }, tenantId).catch(console.error);
    } finally {
      // Clean up the tracker for this campaign
      delete campaignFailureTracker[campaignId];
    }
  }

  async _selectClients(criterio, tenantId) {
    if (!criterio || !criterio.type) {
      return [];
    }

    switch (criterio.type) {
      case 'todos':
        return this.clientRepository.findByTenant(tenantId);
      // Add other cases here as they are implemented
      default:
        return [];
    }
  }

  async _generateRewards(campanha, clients) {
    // ... (existing logic)
  }

  _getRandomDelay(min, max) {
    if (min === 0 && max === 0) return 0;
    return (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
  }

  async _pauseCampaign(campaignId, tenantId) {
    await this.campanhaRepository.update(campaignId, { status: 'paused' }, tenantId);
    cancelCampaign(campaignId); // Cancel any future schedule for this campaign
  }

  async _checkAndTriggerPause(campaignId, tenantId) {
    const failureTimestamps = campaignFailureTracker[campaignId] || [];
    const now = Date.now();
    
    // Keep only failures within the defined window
    const recentFailures = failureTimestamps.filter(
      timestamp => (now - timestamp) / 1000 <= FAILURE_WINDOW_SECONDS
    );
    campaignFailureTracker[campaignId] = recentFailures;

    if (recentFailures.length >= FAILURE_THRESHOLD) {
      await this._pauseCampaign(campaignId, tenantId);
      throw new PauseCampaignError(`Campaign ${campaignId} paused due to high failure rate.`);
    }
  }

  async _sendMessageWithPool(campanha, client, personalizedMessage, maxRetries = 2) {
    let attempts = 0;
    while (attempts < maxRetries) {
      let sender;
      try {
        sender = await senderPoolService.getAvailableSender();
        const delay = this._getRandomDelay(campanha.minMessageDelaySeconds, campanha.maxMessageDelaySeconds);

        if (campanha.mediaUrl) {
          const extension = campanha.mediaUrl.split('.').pop().toLowerCase();
          const isAudio = ['mp3', 'ogg', 'wav', 'aac', 'mpeg'].includes(extension);
          if (isAudio) {
            await this.whatsappService.sendCampaignAudioMessage(sender, client.phone, campanha.mediaUrl, delay);
          } else {
            await this.whatsappService.sendCampaignMediaMessage(sender, client.phone, campanha.mediaUrl, personalizedMessage, delay);
          }
        } else {
          await this.whatsappService.sendCampaignMessage(sender, client.phone, personalizedMessage, delay);
        }
        
        await senderPoolService.recordSuccessfulSend(sender.id);
        return { status: 'sent', errorMessage: null }; // Success
      } catch (err) {
        attempts++;
        console.error(`[Campanha] Tentativa ${attempts} falhou para ${client.phone} com disparador ${sender?.name || 'N/A'}. Erro: ${err.message}`);
        if (sender) {
          // TODO: Implement more granular error checking to decide between 'resting' and 'blocked'
          await senderPoolService.reportFailedSender(sender.id, 'blocked');
        }

        if (attempts >= maxRetries) {
          // Record final failure
          if (campaignFailureTracker[campanha.id]) {
            campaignFailureTracker[campanha.id].push(Date.now());
            await this._checkAndTriggerPause(campanha.id, campanha.tenantId);
          }
          return { status: 'failed', errorMessage: err.message }; // Final failure
        }
        // Wait a bit before retrying with a new sender
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async _sendSimpleMessages(campanha, clients) {
    const numVariants = campanha.mensagens.length;

    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      if (client && client.phone) {
        const variantIndex = i % numVariants;
        const messageTemplate = campanha.mensagens[variantIndex];
        const variantIdentifier = String.fromCharCode(65 + variantIndex); // A, B, C...

        const personalizedMessage = this._buildPersonalizedMessage(messageTemplate, client, {
          nomeCampanha: campanha.nome,
        });
        
        const { status, errorMessage } = await this._sendMessageWithPool(campanha, client, personalizedMessage);

        await CampanhaLog.create({
          campanhaId: campanha.id,
          clienteId: client.id,
          status: status,
          errorMessage: errorMessage,
          variant: variantIdentifier,
        });
      }
    }
  }

  async _sendRewardMessages(campanha, clients, rewards) {
    const clientMap = new Map(clients.map(c => [c.id, c]));
    const numVariants = campanha.mensagens.length;

    for (let i = 0; i < rewards.length; i++) {
      const reward = rewards[i];
      const client = clientMap.get(reward.clienteId);
      if (client && client.phone) {
        const variantIndex = i % numVariants;
        const messageTemplate = campanha.mensagens[variantIndex];
        const variantIdentifier = String.fromCharCode(65 + variantIndex); // A, B, C...
        
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
          variant: variantIdentifier,
        });
      }
    }
  }

  async getCampaignLogs(campaignId) {
    return CampanhaLog.findAll({
      where: { campanhaId: campaignId },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'phone'],
      }],
      order: [['sentAt', 'DESC']],
    });
  }

  async getAbTestResults(campaignId) {
    const results = await CampanhaLog.findAll({
      where: { campanhaId: campaignId },
      attributes: [
        'variant',
        [sequelize.fn('COUNT', sequelize.col('id')), 'recipients'],
        [sequelize.fn('COUNT', sequelize.col('convertedAt')), 'conversions'],
      ],
      group: ['variant'],
      raw: true,
    });

    if (!results || results.length === 0) {
      return {
        summary: {
          totalRecipients: 0,
          totalConversions: 0,
          totalConversionRate: 0,
        },
        variants: [],
      };
    }

    const variantsWithRate = results.map(row => {
      const recipients = parseInt(row.recipients, 10);
      const conversions = parseInt(row.conversions, 10);
      const conversionRate = recipients > 0 ? (conversions / recipients) * 100 : 0;
      return {
        ...row,
        recipients,
        conversions,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      };
    });

    const totalRecipients = variantsWithRate.reduce((sum, v) => sum + v.recipients, 0);
    const totalConversions = variantsWithRate.reduce((sum, v) => sum + v.conversions, 0);
    const totalConversionRate = totalRecipients > 0 ? (totalConversions / totalRecipients) * 100 : 0;

    return {
      summary: {
        totalRecipients,
        totalConversions,
        totalConversionRate: parseFloat(totalConversionRate.toFixed(2)),
      },
      variants: variantsWithRate,
    };
  }

  async getCampaignReport(campaignId) {
    // 1. Get A/B test results (which includes conversion summary)
    const abTestResults = await this.getAbTestResults(campaignId);

    // 2. Get delivery status summary
    const deliveryStatus = await CampanhaLog.findAll({
      where: { campanhaId: campaignId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const deliverySummary = deliveryStatus.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, { sent: 0, failed: 0, skipped: 0 });

    // 3. Combine into a single report object
    return {
      abTest: abTestResults,
      delivery: deliverySummary,
    };
  }
}

module.exports = CampanhaService;
