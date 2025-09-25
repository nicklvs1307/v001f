const { Op } = require('sequelize');
const ApiError = require('../errors/ApiError');
const { Cupom } = require('../../models'); // Importar Cupom para bulkCreate
const crypto = require('crypto');

class CampanhaService {
  constructor(campanhaRepository, clientRepository, cupomRepository, whatsappService) {
    this.campanhaRepository = campanhaRepository;
    this.clientRepository = clientRepository;
    this.cupomRepository = cupomRepository;
    this.whatsappService = whatsappService;
  }

  // Métodos CRUD (sem alterações)
  async create(data) {
    if (!data.nome || !data.recompensaId || !data.dataValidade || !data.criterioSelecao || !data.mensagem) {
      throw ApiError.badRequest('Todos os campos obrigatórios devem ser preenchidos.');
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
    const campanha = await this.campanhaRepository.findById(id, tenantId);
    if (campanha.status !== 'draft') {
      throw ApiError.badRequest('Apenas campanhas em rascunho podem ser editadas.');
    }
    return this.campanhaRepository.update(id, data, tenantId);
  }

  async delete(id, tenantId) {
    const campanha = await this.campanhaRepository.findById(id, tenantId);
    if (campanha.status !== 'draft') {
      throw ApiError.badRequest('Apenas campanhas em rascunho podem ser deletadas.');
    }
    return this.campanhaRepository.delete(id, tenantId);
  }

  // --- LÓGICA DE PROCESSAMENTO ---

  async scheduleProcessing(id, tenantId) {
    const campanha = await this.campanhaRepository.findById(id, tenantId);
    if (campanha.status !== 'draft') {
      throw ApiError.badRequest('Esta campanha já foi ou está sendo processada.');
    }

    await this.campanhaRepository.update(id, { status: 'processing' }, tenantId);

    // Simula a execução em segundo plano para não bloquear a resposta da API
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

    // 1. Selecionar Clientes
    const clients = await this._selectClients(campanha.criterioSelecao, tenantId);
    if (!clients || clients.length === 0) {
      console.log('[Campanha] Nenhum cliente encontrado para os critérios. Campanha concluída.');
      await this.campanhaRepository.update(campaignId, { status: 'sent' }, tenantId);
      return;
    }
    console.log(`[Campanha] ${clients.length} clientes selecionados.`);

    // 2. Gerar Cupons em Massa
    const cupons = await this._generateCoupons(campanha, clients);
    console.log(`[Campanha] ${cupons.length} cupons gerados.`);

    // 3. Enviar Mensagens via WhatsApp
    await this._sendWhatsappMessages(campanha.mensagem, cupons, clients);
    console.log(`[Campanha] Mensagens enviadas.`);

    // 4. Finalizar
    await this.campanhaRepository.update(campaignId, { status: 'sent' }, tenantId);
    console.log(`[Campanha] Processamento da campanha ${campaignId} concluído com sucesso.`);
  }

  async _selectClients(criterio, tenantId) {
    const { type, clientIds, month } = criterio;
    switch (type) {
      case 'all':
        return this.clientRepository.findByTenant(tenantId);
      case 'specific':
        if (!clientIds || !Array.isArray(clientIds)) {
          throw new Error('Critério "specific" requer um array de "clientIds".');
        }
        return this.clientRepository.findByIds(clientIds, tenantId);
      case 'birthday':
        if (!month || typeof month !== 'number' || month < 1 || month > 12) {
          throw new Error('Critério "birthday" requer um "month" numérico (1-12).');
        }
        return this.clientRepository.findByBirthMonth(month, tenantId);
      default:
        throw new Error(`Tipo de critério desconhecido: ${type}`);
    }
  }

  async _generateCoupons(campanha, clients) {
    const cuponsParaCriar = clients.map(client => {
      const codigo = `CAMP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      return {
        tenantId: campanha.tenantId,
        recompensaId: campanha.recompensaId,
        campanhaId: campanha.id,
        clienteId: client.id,
        codigo: codigo,
        dataGeracao: new Date(),
        dataValidade: campanha.dataValidade,
        status: 'active',
      };
    });

    return this.cupomRepository.bulkCreate(cuponsParaCriar);
  }

  async _sendWhatsappMessages(mensagemTemplate, cupons, clients) {
    const clientMap = new Map(clients.map(c => [c.id, c]));

    for (const cupom of cupons) {
      const client = clientMap.get(cupom.clienteId);
      if (client && client.phone) {
        const mensagem = mensagemTemplate
          .replace(/{{nome_cliente}}/g, client.name)
          .replace(/{{codigo_cupom}}/g, cupom.codigo);
        
        // O número de telefone precisa estar no formato E.164 para a maioria das APIs
        // Ex: +5511999998888. Assumindo que o seu já está correto.
        await this.whatsappService.sendMessage(client.phone, mensagem);
      }
    }
  }
}

module.exports = CampanhaService;