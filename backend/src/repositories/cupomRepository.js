const { Cupom, Recompensa, Client } = require('../../models');
const { Op, fn, col } = require('sequelize');

class CupomRepository {
  async bulkCreate(cupons) {
    return Cupom.bulkCreate(cupons);
  }

  async createCupom(cupomData) {
    return Cupom.create(cupomData);
  }

  async getAllCupons(tenantId = null) {
    const whereClause = tenantId ? { tenantId } : {};
    return Cupom.findAll({
      where: whereClause,
      include: [{ model: Recompensa, as: 'recompensa' }, { model: Client, as: 'cliente' }],
    });
  }

  async getCuponsSummary(tenantId = null) {
    const whereClause = tenantId ? { tenantId } : {};
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalCupons = await Cupom.count({ where: whereClause });

    const usedCupons = await Cupom.count({
      where: { ...whereClause, status: 'used' },
    });

    const expiredCupons = await Cupom.count({
      where: {
        ...whereClause,
        status: 'pending',
        dataValidade: { [Op.lt]: today },
      },
    });

    const activeCupons = await Cupom.count({
        where: {
            ...whereClause,
            status: 'pending',
            dataValidade: { [Op.gte]: today },
        }
    });

    const expiringSoonCupons = await Cupom.count({
        where: {
            ...whereClause,
            status: 'pending',
            dataValidade: {
                [Op.gte]: today,
                [Op.lt]: sevenDaysFromNow,
            },
        },
    });

    const cuponsByType = await Cupom.findAll({
        where: whereClause,
        attributes: [
            [fn('COUNT', col('Cupom.id')), 'count'],
        ],
        include: [{
            model: Recompensa,
            as: 'recompensa',
            attributes: ['type'],
            required: true,
        }],
        group: ['recompensa.type'],
        raw: true,
    });

    const formattedCuponsByType = cuponsByType.map(item => ({
        type: item['recompensa.type'],
        count: parseInt(item.count, 10),
    }));

    return {
      totalCupons,
      usedCupons,
      expiredCupons,
      activeCupons,
      expiringSoonCupons,
      cuponsByType: formattedCuponsByType,
    };
  }

  async getCupomByCodigo(codigo, tenantId) {
    const whereClause = { codigo };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    return Cupom.findOne({
      where: whereClause,
      include: [{ model: Recompensa, as: 'recompensa' }, { model: Client, as: 'cliente' }],
    });
  }

  async getCupomById(id, tenantId) {
    const whereClause = { id };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    return Cupom.findOne({
      where: whereClause,
      include: [{ model: Recompensa, as: 'recompensa' }, { model: Client, as: 'cliente' }],
    });
  }

  async updateCupom(id, tenantId, cupomData) {
    const [updatedRows] = await Cupom.update(cupomData, {
      where: { id, tenantId },
      returning: true,
    });
    if (updatedRows > 0) {
      return this.getCupomById(id, tenantId);
    }
    return null;
  }

  async findByClientAndSurvey(clienteId, pesquisaId) {
    return Cupom.findOne({
      where: {
        clienteId: clienteId,
        pesquisaId: pesquisaId,
      },
      order: [['dataGeracao', 'DESC']],
    });
  }
}

module.exports = new CupomRepository();