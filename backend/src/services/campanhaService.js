const { Op, Sequelize } = require('sequelize');
const ApiError = require('../errors/ApiError');
const { Cupom, RoletaSpin } = require('../../models');
const crypto = require('crypto');

class CampanhaService {
  constructor(campanhaRepository, clientRepository, cupomRepository, roletaSpinRepository, whatsappService) {
    this.campanhaRepository = campanhaRepository;
    this.clientRepository = clientRepository;
    this.cupomRepository = cupomRepository;
    this.roletaSpinRepository = roletaSpinRepository; // Injetar novo repositório
    this.whatsappService = whatsappService;
  }

  // Métodos CRUD (sem alterações)
  async create(data) {
    // Garante que dataValidade seja definida para evitar erros de notNull.
    // Prioriza endDate se existir, que é a nova abordagem de agendamento.
    if (data.endDate && !data.dataValidade) {
      data.dataValidade = data.endDate;
    }

    // Se ainda assim dataValidade não estiver definida, cria um fallback para 30 dias.
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
    return this.campanhaRepository.findById(id, tenantId);
  }

  async update(id, data, tenantId) {
    console.log(`[CampanhaService] Updating campaign ${id} with data:`, data);
    return this.campanhaRepository.update(id, data, tenantId);
  }

  async delete(id, tenantId) {
    // ... (lógica existente)
  }

  // --- LÓGICA DE PROCESSAMENTO ---

  async scheduleProcessing(id, tenantId) {
    const campanha = await this.campanhaRepository.findById(id, tenantId);
    if (campanha.status !== 'draft') {
      throw ApiError.badRequest('Esta campanha já foi ou está sendo processada.');
    }

    await this.campanhaRepository.update(id, { status: 'processing' }, tenantId);

    setTimeout(() => {
      this._processCampaign(id, tenantId).catch(err => {
        console.error(`[Campanha] Falha crítica no processamento da campanha ${id}:`, err);
        this.campanhaRepository.update(id, { status: 'failed' }, tenantId);
      });
    }, 0);

    return { message: 'Campanha agendada para processamento.' };
  }

  async _processCampaign(campaignId, tenantId) {
    console.log(`[Campanha] Iniciando processamento para campanha ${campaignId}`);
    const campanha = await this.campanhaRepository.findById(campaignId, tenantId);

    if (campanha.rewardType === 'RECOMPENSA' && !campanha.recompensaId) {
      console.error(`[Campanha] Falha no processamento da campanha ${campaignId}: Campanha de recompensa não tem uma recompensa associada.`);
      await this.campanhaRepository.update(campaignId, { status: 'failed' }, tenantId);
      return;
    }

    const clients = await this._selectClients(campanha.criterioSelecao.type, tenantId);
    if (!clients || clients.length === 0) {
      console.log(`[Campanha] Nenhum cliente encontrado para os critérios da campanha ${campaignId}.`);
      await this.campanhaRepository.update(campaignId, { status: 'sent' }, tenantId);
      return;
    }

    if (campanha.rewardType === 'none') {
      await this._sendSimpleMessages(campanha, clients);
    } else {
      const rewards = await this._generateRewards(campanha, clients);
      await this._sendRewardMessages(campanha, clients, rewards);
    }

    await this.campanhaRepository.update(campaignId, { status: 'sent' }, tenantId);
    console.log(`[Campanha] Processamento da campanha ${campaignId} concluído com sucesso.`);
  }

  async _selectClients(criterio, tenantId) {
    switch (criterio) {
      case 'todos':
        return this.clientRepository.findByTenant(tenantId);
      case 'aniversariantes':
        const currentMonth = new Date().getMonth() + 1;
        return this.clientRepository.findByBirthMonth(currentMonth, tenantId);
      case 'novatos':
        return this.clientRepository.findNovatos(tenantId);
      case 'fieis':
        return this.clientRepository.findFieis(tenantId);
      case 'super_cliente':
        return this.clientRepository.findSuperClientes(tenantId);
      case 'inativos':
        return this.clientRepository.findInativos(tenantId);
      case 'curiosos':
        return this.clientRepository.findCuriosos(tenantId);
      default:
        return [];
    }
  }

  async _generateRewards(campanha, clients) {
    if (campanha.rewardType === 'RECOMPENSA') {
      if (!campanha.recompensaId) {
        return []; 
      }
      const cuponsParaCriar = clients.map(client => ({
        tenantId: campanha.tenantId,
        recompensaId: campanha.recompensaId,
        campanhaId: campanha.id,
        clienteId: client.id,
        codigo: `CAMP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        dataGeracao: new Date(),
        dataValidade: campanha.dataValidade,
        status: 'active',
      }));
      return this.cupomRepository.bulkCreate(cuponsParaCriar);
    } else if (campanha.rewardType === 'ROLETA') {
      const spinsParaCriar = clients.map(client => ({
        tenantId: campanha.tenantId,
        roletaId: campanha.roletaId,
        clienteId: client.id,
        campanhaId: campanha.id,
        token: crypto.randomBytes(16).toString('hex'),
        status: 'PENDING',
        expiresAt: campanha.dataValidade, 
      }));
      return this.roletaSpinRepository.bulkCreate(spinsParaCriar);
    }

    return [];
  }

  async _sendSimpleMessages(campanha, clients) {
    const delay = campanha.messageDelaySeconds * 1000;
    console.log(`[Campanha] Enviando ${clients.length} mensagens simples para a campanha ${campanha.id}.`);
    for (const client of clients) {
      if (client && client.phone) {
        let personalizedMessage = campanha.mensagem.replace(/{{nome_cliente}}/g, client.name);
        try {
          await this.whatsappService.sendTenantMessage(campanha.tenantId, client.phone, personalizedMessage);
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (err) {
          console.error(`[Campanha] Falha ao enviar mensagem para ${client.phone} na campanha ${campanha.id}:`, err.message);
        }
      }
    }
  }

  async _sendRewardMessages(campanha, clients, rewards) {
    const clientMap = new Map(clients.map(c => [c.id, c]));
    const delay = campanha.messageDelaySeconds * 1000; // Convertendo segundos para milissegundos

    for (const reward of rewards) {
      const client = clientMap.get(reward.clienteId);
      if (client && client.phone) {
        let personalizedMessage = campanha.mensagem.replace(/{{nome_cliente}}/g, client.name);
        let rewardCode = '';

        if (campanha.rewardType === 'RECOMPENSA') {
          rewardCode = reward.codigo;
          personalizedMessage = personalizedMessage.replace(/{{codigo_premio}}/g, rewardCode);
        } else if (campanha.rewardType === 'ROLETA') {
          // Assumindo que a URL base da roleta virá das configurações do tenant ou .env
          const roletaBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          rewardCode = `${roletaBaseUrl}/roleta/spin/${reward.token}`;
          personalizedMessage = personalizedMessage.replace(/{{codigo_premio}}/g, rewardCode);
        }

        try {
          await this.whatsappService.sendTenantMessage(campanha.tenantId, client.phone, personalizedMessage);
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (err) {
          console.error(`[Campanha] Falha ao enviar mensagem para ${client.phone} na campanha ${campanha.id}:`, err.message);
          // Continuar o processo mesmo que uma mensagem falhe
        }
      }
    }
  }
}

module.exports = CampanhaService;
