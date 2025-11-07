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

  // async initScheduledCampaigns() {
  //   console.log('[CampanhaService] Inicializando campanhas agendadas...');
  //   const scheduledCampaigns = await this.campanhaRepository.findAllWhere({
  //     status: 'scheduled',
  //     startDate: { [Op.ne]: null },
  //   });

  //   for (const campaign of scheduledCampaigns) {
  //     scheduleCampaign(campaign, this._processCampaign.bind(this));
  //   }
  //   console.log(`[CampanhaService] ${scheduledCampaigns.length} campanhas reagendadas.`);
  // }

  async create(data) {
    return this.campanhaRepository.create(data);
  }

  async getAll(tenantId) {
    return this.campanhaRepository.findAll(tenantId);
  }

  async getById(id, tenantId) {
    return this.campanhaRepository.findById(id, tenantId, { include: ['recompensa'] });
  }

  async update(id, data, tenantId) {
    return this.campanhaRepository.update(id, data, tenantId);
  }

  async delete(id, tenantId) {
    // cancelCampaign(id); // Adicionar se houver lógica de agendamento
    return this.campanhaRepository.delete(id, tenantId);
  }

  async scheduleProcessing(id, tenantId) {
    // Lógica de agendamento removida temporariamente
    const campanha = await this.getById(id, tenantId);
    if (['processing', 'sent'].includes(campanha.status)) {
      throw ApiError.badRequest('Esta campanha já foi processada.');
    }

    this._processCampaign(id, tenantId).catch(err => {
        console.error(`[Campanha] Falha crítica no processamento da campanha ${id}:`, err);
        this.campanhaRepository.update(id, { status: 'failed' }, tenantId);
    });

    return { message: 'Campanha enviada para processamento imediato.' };
  }
  
  async cancelScheduling(id, tenantId) {
    // Lógica de cancelamento removida temporariamente
    return this.campanhaRepository.update(id, { status: 'draft' }, tenantId);
  }

  async sendTest(id, tenantId, testPhoneNumber) {
    const campanha = await this.getById(id, tenantId);
    const fakeClient = { name: 'Cliente Teste', phone: testPhoneNumber };
    let rewardCode = '[CODIGO_TESTE]';

    if (campanha.rewardType === 'ROLETA') {
      const roletaBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      rewardCode = `${roletaBaseUrl}/roleta/spin/[TOKEN_TESTE]`
    }

    const personalizedMessage = this._buildPersonalizedMessage(campanha.mensagem, fakeClient, {
      codigo: rewardCode,
      dataValidade: campanha.dataValidade,
      nomeRecompensa: campanha.recompensa ? campanha.recompensa.nome : '[RECOMPENSA_TESTE]',
      nomeCampanha: campanha.nome,
    });

    await this.whatsappService.sendTenantMessage(tenantId, testPhoneNumber, personalizedMessage);
    return { message: `Mensagem de teste enviada para ${testPhoneNumber}` };
  }

  _buildPersonalizedMessage(template, client, rewardData = {}) {
    let message = template.replace(/{{nome_cliente}}/g, client.name.split(' ')[0]);
    
    if (rewardData.codigo) {
      message = message.replace(/{{codigo_premio}}/g, rewardData.codigo);
    }
    if (rewardData.dataValidade) {
      const formattedDate = new Date(rewardData.dataValidade).toLocaleDateString('pt-BR');
      message = message.replace(/{{data_validade}}/g, formattedDate);
    }
    if (rewardData.nomeRecompensa) {
      message = message.replace(/{{nome_recompensa}}/g, rewardData.nomeRecompensa);
    }
    if (rewardData.nomeCampanha) {
      message = message.replace(/{{nome_campanha}}/g, rewardData.nomeCampanha);
    }

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
    // ... (lógica existente)
  }

  async _generateRewards(campanha, clients) {
    // ... (lógica existente)
  }

  async _sendSimpleMessages(campanha, clients) {
    const delay = (campanha.messageDelaySeconds || 0) * 1000;
    for (const client of clients) {
      if (client && client.phone) {
        const personalizedMessage = this._buildPersonalizedMessage(campanha.mensagem, client, {
          nomeCampanha: campanha.nome,
        });
        try {
          await this.whatsappService.sendTenantMessage(campanha.tenantId, client.phone, personalizedMessage);
          if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
        } catch (err) {
          console.error(`[Campanha] Falha ao enviar mensagem para ${client.phone}:`, err.message);
        }
      }
    }
  }

  async _sendRewardMessages(campanha, clients, rewards) {
    const clientMap = new Map(clients.map(c => [c.id, c]));
    const delay = (campanha.messageDelaySeconds || 0) * 1000;

    for (const reward of rewards) {
      const client = clientMap.get(reward.clienteId);
      if (client && client.phone) {
        // ... (lógica de recompensa)
        const personalizedMessage = this._buildPersonalizedMessage(campanha.mensagem, client, {
            // ...
        });
        try {
          await this.whatsappService.sendTenantMessage(campanha.tenantId, client.phone, personalizedMessage);
          if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
        } catch (err) {
          console.error(`[Campanha] Falha ao enviar mensagem para ${client.phone}:`, err.message);
        }
      }
    }
  }
}

module.exports = CampanhaService;
