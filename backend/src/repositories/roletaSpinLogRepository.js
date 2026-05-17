'use strict';
const { RoletaSpinLog, Cupom, Op, fn, col, literal } = require('../../models');

class RoletaSpinLogRepository {
  async logSpin({ tenantId, roletaId, premioId, clienteId }) {
    return RoletaSpinLog.create({
      tenantId,
      roletaId,
      premioId,
      clienteId,
    });
  }

  async countSpinsSinceLastAward(tenantId, roletaId, premioId) {
    const lastAward = await RoletaSpinLog.findOne({
      where: {
        tenantId,
        roletaId,
        premioId,
      },
      order: [['createdAt', 'DESC']],
    });

    if (!lastAward) {
      return 999999;
    }

    const count = await RoletaSpinLog.count({
      where: {
        tenantId,
        roletaId,
        createdAt: {
          [Op.gt]: lastAward.createdAt,
        },
      },
    });

    return count;
  }

  async countStockUsage(tenantId, premioId, resetType) {
    const cupomWhere = {
      tenantId,
      status: 'used',
      pesquisaId: { [Op.ne]: null },
    };

    const now = new Date();
    let dateFilter = null;

    switch (resetType) {
      case 'diario': {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        dateFilter = startOfDay;
        break;
      }
      case 'semanal': {
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - mondayOffset);
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = startOfWeek;
        break;
      }
      case 'mensal': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = startOfMonth;
        break;
      }
      case 'nunca':
      default:
        dateFilter = null;
        break;
    }

    if (dateFilter) {
      cupomWhere.dataUtilizacao = { [Op.gte]: dateFilter };
    }

    const cupons = await Cupom.findAll({
      where: cupomWhere,
      include: [
        {
          model: require('../../models').Pesquisa,
          as: 'pesquisa',
          attributes: [],
          required: true,
        },
      ],
      raw: true,
    });

    const premioIds = cupons
      .map(c => c['pesquisa.roletaId'])
      .filter(Boolean);

    const uniquePremioIds = [...new Set(premioIds)];

    if (uniquePremioIds.length === 0) {
      return 0;
    }

    const count = await Cupom.count({
      where: {
        ...cupomWhere,
        id: {
          [Op.in]: cupons.map(c => c.id),
        },
      },
    });

    return count;
  }

  async getPremioStockInfo(tenantId, premioId, resetType) {
    const { RoletaPremio, Pesquisa, Cupom } = require('../../models');

    const premio = await RoletaPremio.findByPk(premioId);
    if (!premio) return null;

    if (premio.estoqueMaximo === null || premio.estoqueMaximo === undefined) {
      return {
        estoqueMaximo: null,
        estoqueUsado: 0,
        estoqueDisponivel: null,
        resetTipo: premio.estoqueResetTipo,
        ilimitado: true,
      };
    }

    const now = new Date();
    let dateFilter = null;

    switch (premio.estoqueResetTipo || resetType || 'nunca') {
      case 'diario': {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        dateFilter = startOfDay;
        break;
      }
      case 'semanal': {
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - mondayOffset);
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = startOfWeek;
        break;
      }
      case 'mensal': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = startOfMonth;
        break;
      }
      default:
        dateFilter = null;
        break;
    }

    const pesquisas = await Pesquisa.findAll({
      where: { roletaId: premio.roletaId, tenantId },
      attributes: ['id'],
      raw: true,
    });

    const pesquisaIds = pesquisas.map(p => p.id);

    if (pesquisaIds.length === 0) {
      return {
        estoqueMaximo: premio.estoqueMaximo,
        estoqueUsado: 0,
        estoqueDisponivel: premio.estoqueMaximo,
        resetTipo: premio.estoqueResetTipo,
        ilimitado: false,
      };
    }

    const cupomWhere = {
      tenantId,
      status: 'used',
      pesquisaId: { [Op.in]: pesquisaIds },
    };

    if (dateFilter) {
      cupomWhere.dataUtilizacao = { [Op.gte]: dateFilter };
    }

    const estoqueUsado = await Cupom.count({
      where: cupomWhere,
    });

    return {
      estoqueMaximo: premio.estoqueMaximo,
      estoqueUsado,
      estoqueDisponivel: premio.estoqueMaximo - estoqueUsado,
      resetTipo: premio.estoqueResetTipo,
      ilimitado: false,
    };
  }

  async resetStock(tenantId, premioId) {
    const { RoletaPremio } = require('../../models');
    const premio = await RoletaPremio.findOne({
      where: { id: premioId, tenantId },
    });

    if (!premio) return null;

    return {
      message: 'Estoque resetado com sucesso',
      premioId,
      novoEstoqueDisponivel: premio.estoqueMaximo,
    };
  }
}

module.exports = new RoletaSpinLogRepository();
