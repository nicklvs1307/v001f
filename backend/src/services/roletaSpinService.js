const { RoletaSpin, Roleta, RoletaPremio, Client } = require('../../models');
const { fromZonedTime } = require('date-fns-tz');
const ApiError = require('../errors/ApiError');

class RoletaSpinService {
  async validateToken(token) {
    const roletaSpin = await RoletaSpin.findOne({
      where: { token },
      include: [
        { model: Roleta, as: 'roleta', include: [{ model: RoletaPremio, as: 'premios' }] },
        { model: Client, as: 'client' },
      ],
    });

    if (!roletaSpin) {
      throw ApiError.notFound('Token de roleta não encontrado.');
    }

    if (roletaSpin.status === 'USED') {
      throw ApiError.badRequest('Este token já foi utilizado.');
    }

    if (roletaSpin.expiresAt && fromZonedTime(new Date(), 'America/Sao_Paulo') > roletaSpin.expiresAt) {
      throw ApiError.badRequest('Este token expirou.');
    }

    // Retorna os dados necessários para a página da roleta
    return {
      id: roletaSpin.id,
      roletaId: roletaSpin.roletaId,
      clienteId: roletaSpin.clienteId,
      campanhaId: roletaSpin.campanhaId,
      token: roletaSpin.token,
      status: roletaSpin.status,
      expiresAt: roletaSpin.expiresAt,
      roleta: roletaSpin.roleta,
      client: roletaSpin.client,
    };
  }

  async useSpin(token, premioId) {
    const roletaSpin = await RoletaSpin.findOne({
      where: { token },
    });

    if (!roletaSpin) {
      throw ApiError.notFound('Token de roleta não encontrado.');
    }

    if (roletaSpin.status === 'USED') {
      throw ApiError.badRequest('Este token já foi utilizado.');
    }

    if (roletaSpin.expiresAt && fromZonedTime(new Date(), 'America/Sao_Paulo') > roletaSpin.expiresAt) {
      throw ApiError.badRequest('Este token expirou.');
    }

    // Atualiza o status do spin para 'USED' e registra o prêmio
    roletaSpin.status = 'USED';
    roletaSpin.premioId = premioId;
    await roletaSpin.save();

    return roletaSpin;
  }
}

module.exports = new RoletaSpinService();