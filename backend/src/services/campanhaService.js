const { Op, Sequelize } = require('sequelize');
const ApiError = require('../errors/ApiError');
const { Cupom, RoletaSpin, Recompensa } = require('../../models');
const crypto = require('crypto');
const { scheduleCampaign } = require('../jobs/campaignScheduler');

class CampanhaService {
  constructor(campanhaRepository, clientRepository, cupomRepository, roletaSpinRepository, whatsappService) {
    this.campanhaRepository = campanhaRepository;
    this.clientRepository = clientRepository;
    this.cupomRepository = cupomRepository;
    this.roletaSpinRepository = roletaSpinRepository;
    this.whatsappService = whatsappService;
  }

  async create(data) {
    if (data.endDate && !data.dataValidade) {
      data.dataValidade = data.endDate;
    }
    if (!data.dataValidade) {
      const defaultValidade = new Date();
      defaultValidade.setDate(defaultValidade.getDate() + 30);
      data.dataValidade = defaultValidade;
    }
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
    // Implementar a lógica de exclusão, se necessário
  }

  async scheduleProcessing(id, tenantId) {
    const campanha = await this.getById(id, tenantId);
    if (['processing', 'sent', 'scheduled'].includes(campanha.status)) {
      throw ApiError.badRequest('Esta campanha já foi processada ou agendada.');
    }

    if (campanha.startDate && new Date(campanha.startDate) > new Date()) {
      scheduleCampaign(campanha);
      await this.campanhaRepository.update(id, { status: 'scheduled' }, tenantId);
      return { message: 'Campanha agendada com sucesso.' };
    }

    await this.campanhaRepository.update(id, { status: 'processing' }, tenantId);
    this._processCampaign(id, tenantId).catch(err => {
      console.error(`[Campanha] Falha crítica no processamento da campanha ${id}:`, err);
      this.campanhaRepository.update(id, { status: 'failed' }, tenantId);
    });

    return { message: 'Campanha enviada para processamento imediato.' };
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
  }

  async _selectClients(criterio, tenantId) {
    switch (criterio.type) {
      case 'all': return this.clientRepository.findByTenant(tenantId);
      case 'birthday':
        const month = criterio.month || new Date().getMonth() + 1;
        return this.clientRepository.findByBirthMonth(month, tenantId);
      case 'specific': return this.clientRepository.findByIds(criterio.clientIds, tenantId);
      // Adicionar outros casos aqui
      default: return [];
    }
  }

  async _generateRewards(campanha, clients) {
    const rewardType = campanha.rewardType.toUpperCase();
    if (rewardType === 'RECOMPENSA') {
      return this.cupomRepository.bulkCreate(clients.map(client => ({
        tenantId: campanha.tenantId,
        recompensaId: campanha.recompensaId,
        campanhaId: campanha.id,
        clienteId: client.id,
        codigo: `CAMP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        dataGeracao: new Date(),
        dataValidade: campanha.dataValidade,
        status: 'active',
      })));
    } else if (rewardType === 'ROLETA') {
      return this.roletaSpinRepository.bulkCreate(clients.map(client => ({
        tenantId: campanha.tenantId,
        roletaId: campanha.roletaId,
        clienteId: client.id,
        campanhaId: campanha.id,
        token: crypto.randomBytes(16).toString('hex'),
        status: 'PENDING',
        expiresAt: campanha.dataValidade,
      })));
    }
    return [];
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
        const rewardType = campanha.rewardType.toUpperCase();
        let rewardCode = '';
        if (rewardType === 'RECOMPENSA') {
          rewardCode = reward.codigo;
        } else if (rewardType === 'ROLETA') {
          const roletaBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          rewardCode = `${roletaBaseUrl}/roleta/spin/${reward.token}`;
        }

        const personalizedMessage = this._buildPersonalizedMessage(campanha.mensagem, client, {
          codigo: rewardCode,
          dataValidade: campanha.dataValidade,
          nomeRecompensa: campanha.recompensa ? campanha.recompensa.nome : '',
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
}

module.exports = CampanhaService;
