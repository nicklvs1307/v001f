const { Cupom, Recompensa, Client } = require('../../models');
const { fromZonedTime } = require('date-fns-tz');
const { Op, fn, col } = require('sequelize');

class CupomRepository {
  async bulkCreate(cupons) {
    return Cupom.bulkCreate(cupons);
  }

  async create(cupomData) {
    return Cupom.create(cupomData);
  }

  async getAllCupons(tenantId = null, filters = {}) {
    const whereClause = tenantId ? { tenantId } : {};
    const include = [
      { model: Recompensa, as: 'recompensa' },
      { model: Client, as: 'cliente' },
    ];

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.recompensaId) {
      whereClause.recompensaId = filters.recompensaId;
    }

    if (filters.startDate && filters.endDate) {
      whereClause.dataGeracao = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)],
      };
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      whereClause[Op.or] = [
        { '$recompensa.name$': { [Op.iLike]: searchTerm } },
        { '$cliente.name$': { [Op.iLike]: searchTerm } },
        { codigo: { [Op.iLike]: searchTerm } },
      ];
    }

    return Cupom.findAll({
      where: whereClause,
      include: include,
      order: [['createdAt', 'DESC']],
    });
  }

  async getCuponsSummary(tenantId = null) {
    const whereClause = tenantId ? { tenantId } : {};
    const today = fromZonedTime(new Date(), 'America/Sao_Paulo');
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalCupons = await Cupom.count({ where: whereClause });

    const usedCupons = await Cupom.count({
      where: { ...whereClause, status: 'used' },
    });

    const expiredCupons = await Cupom.count({
      where: {
        ...whereClause,
        status: { [Op.ne]: 'used' }, // Considera 'pending' e outros que não foram usados
        dataValidade: { [Op.lt]: today },
      },
    });

    const activeCupons = await Cupom.count({
        where: {
            ...whereClause,
            status: 'active',
            dataValidade: { [Op.gte]: today },
        }
    });

    const expiringSoonCupons = await Cupom.count({
        where: {
            ...whereClause,
            status: 'active',
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

    const dailyGenerated = await Cupom.findAll({
      where: {
        ...whereClause,
        createdAt: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });

    const recentCupons = await Cupom.findAll({
      where: whereClause,
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Recompensa, as: 'recompensa', attributes: ['name'] },
        { model: Client, as: 'cliente', attributes: ['name'] },
      ],
    });

    return {
      totalCupons,
      usedCupons,
      expiredCupons,
      activeCupons,
      expiringSoonCupons,
      cuponsByType: formattedCuponsByType,
      dailyGenerated,
      recentCupons,
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

  async deleteCupom(id, tenantId) {
    const whereClause = { id };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    return Cupom.destroy({ where: whereClause });
  }
}

module.exports = new CupomRepository();