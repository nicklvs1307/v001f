const { Cupom, Recompensa, Client, Tenant } = require("../../models");
const { now } = require("../utils/dateUtils");
const { Op, fn, col, literal } = require("sequelize");
const { subDays, addDays } = require("date-fns");

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
      { model: Recompensa, as: "recompensa" },
      { model: Client, as: "client" },
      { model: Tenant, as: "tenant" },
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
        { "$recompensa.name$": { [Op.iLike]: searchTerm } },
        { "$client.name$": { [Op.iLike]: searchTerm } },
        { codigo: { [Op.iLike]: searchTerm } },
      ];
    }

    return Cupom.findAll({
      where: whereClause,
      include: include,
      order: [["dataGeracao", "DESC"]],
    });
  }

  async getCuponsSummary(tenantId = null) {
    const whereClause = tenantId ? { tenantId } : {};
    const today = now();
    const thirtyDaysAgo = subDays(today, 30);
    const sevenDaysFromNow = addDays(today, 7);

    // 1. Separate counts for robustness
    const totalCupons = await Cupom.count({ where: whereClause });
    const usedCupons = await Cupom.count({
      where: { ...whereClause, status: "used" },
    });
    const expiredCupons = await Cupom.count({
      where: {
        ...whereClause,
        status: { [Op.ne]: "used" },
        dataValidade: { [Op.lt]: today },
      },
    });
    const activeCupons = await Cupom.count({
      where: {
        ...whereClause,
        status: "active",
        dataValidade: { [Op.gte]: today },
      },
    });
    const expiringSoonCupons = await Cupom.count({
      where: {
        ...whereClause,
        status: "active",
        dataValidade: { [Op.between]: [today, sevenDaysFromNow] },
      },
    });

    // 2. Group by reward NAME instead of type
    const cuponsByTypeData = await Cupom.findAll({
      where: whereClause,
      attributes: [[fn("COUNT", col("Cupom.id")), "count"]],
      include: [
        {
          model: Recompensa,
          as: "recompensa",
          attributes: ["name"], // Use name for grouping
          required: true,
        },
      ],
      group: ["recompensa.name"],
      raw: true,
    });

    const formattedCuponsByType = cuponsByTypeData.map((item) => ({
      name: item["recompensa.name"], // The key is now recompensa.name
      count: parseInt(item.count, 10),
    }));

    const dailyGenerated = await Cupom.findAll({
      where: {
        ...whereClause,
        dataGeracao: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
      attributes: [
        [fn("DATE", col("dataGeracao")), "date"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: [fn("DATE", col("dataGeracao"))],
      order: [[fn("DATE", col("dataGeracao")), "ASC"]],
      raw: true,
    });

    const recentCupons = await Cupom.findAll({
      where: whereClause,
      limit: 10,
      order: [["dataGeracao", "DESC"]],
      include: [
        { model: Recompensa, as: "recompensa", attributes: ["name"] },
        { model: Client, as: "client", attributes: ["name"] },
      ],
    });

    return {
      totalCupons,
      usedCupons,
      expiredCupons,
      activeCupons,
      expiringSoonCupons,
      cuponsByType: formattedCuponsByType, // Return the correctly grouped and formatted data
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
      include: [
        { model: Recompensa, as: "recompensa" },
        { model: Client, as: "client" },
      ],
    });
  }

  async getCupomById(id, tenantId) {
    const whereClause = { id };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    return Cupom.findOne({
      where: whereClause,
      include: [
        { model: Recompensa, as: "recompensa" },
        { model: Client, as: "client" },
      ],
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
      order: [["dataGeracao", "DESC"]],
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
