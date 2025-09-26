const { Cupom, Recompensa } = require('../../models');
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
}

module.exports = new CupomRepository();