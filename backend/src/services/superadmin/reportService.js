const {
  Tenant,
  Usuario,
  Campanha,
  Pesquisa,
  WhatsappSender,
  Client,
  Resposta,
  Franchisor,
  Plan, // Importar Plan
  sequelize,
} = require("../../../models");
const { Op } = require("sequelize");

class ReportService {
  async getSuperAdminDashboard() {
    const totalTenants = await Tenant.count();
    const totalUsers = await Usuario.count();
    const totalSurveys = await Pesquisa.count();
    const totalFranchisors = await Franchisor.count();

    const userGrowth = await Usuario.findAll({
      attributes: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("createdAt")),
          "month",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["month"],
      order: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("createdAt")),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Buscar distribuição real de planos
    const tenantsByPlanRaw = await Tenant.findAll({
      attributes: ['plan', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['plan'],
      raw: true
    });

    // Buscar detalhes dos planos para calcular MRR
    const allPlans = await Plan.findAll({ raw: true });
    const planMap = new Map(allPlans.map(p => [p.name.toLowerCase(), p])); // Normalizar nome para chave

    let totalMRR = 0;
    const tenantsByPlan = tenantsByPlanRaw.map(item => {
      // Tentar encontrar o plano pelo nome (string) armazenado no tenant
      // Nota: Idealmente o tenant deveria ter planId (UUID), mas estamos usando string 'plan' por legado
      const planName = item.plan ? item.plan.toLowerCase() : 'basic';
      const planInfo = planMap.get(planName) || planMap.get('básico') || { price: 0, name: item.plan };
      
      const count = parseInt(item.count, 10);
      totalMRR += count * parseFloat(planInfo.price || 0);

      return {
        name: item.plan || 'Desconhecido',
        value: count,
        revenue: count * parseFloat(planInfo.price || 0)
      };
    });

    return {
      totalTenants,
      totalUsers,
      totalSurveys,
      totalFranchisors,
      totalMRR, // Nova métrica: Receita Recorrente Mensal
      userGrowth: userGrowth.map((item) => ({
        name: new Date(item.month).toLocaleString("default", {
          month: "short",
        }),
        value: parseInt(item.count, 10),
      })),
      tenantsByPlan,
    };
  }

  async getSystemOverviewReport() {
    const totalTenants = await Tenant.count();
    const totalUsers = await Usuario.count();
    const totalCampaigns = await Campanha.count();
    const senderPoolStatus = await WhatsappSender.findAll({
      attributes: [
        "status",
        [Tenant.sequelize.fn("COUNT", Tenant.sequelize.col("status")), "count"],
      ],
      group: ["status"],
    });

    return {
      totalTenants,
      totalUsers,
      totalCampaigns,
      senderPoolStatus: senderPoolStatus.map((s) => ({
        status: s.status,
        count: s.dataValues.count,
      })),
    };
  }

  async getTenantReports() {
    const tenants = await Tenant.findAll({
      attributes: ["id", "name"],
      raw: true,
    });

    const tenantIds = tenants.map((t) => t.id);

    const countQuery = (model, where = {}) =>
      model.count({
        where: { tenantId: { [Op.in]: tenantIds }, ...where },
        group: ["tenantId"],
        raw: true,
      });

    const [
      clientCounts,
      campaignCounts,
      surveyCounts,
      responseCounts,
    ] = await Promise.all([
      countQuery(Client),
      countQuery(Campanha, {
        status: { [Op.in]: ["processing", "scheduled"] },
      }),
      countQuery(Pesquisa),
      countQuery(Resposta),
    ]);

    const createCountMap = (counts) =>
      new Map(counts.map((c) => [c.tenantId, c.count]));

    const clientMap = createCountMap(clientCounts);
    const campaignMap = createCountMap(campaignCounts);
    const surveyMap = createCountMap(surveyCounts);
    const responseMap = createCountMap(responseCounts);

    const tenantReports = tenants.map((tenant) => {
      const totalSurveys = surveyMap.get(tenant.id) || 0;
      const totalResponses = responseMap.get(tenant.id) || 0;
      const averageResponseRate =
        totalSurveys > 0 ? totalResponses / totalSurveys : 0;

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        activeClients: clientMap.get(tenant.id) || 0,
        activeCampaigns: campaignMap.get(tenant.id) || 0,
        totalSurveys,
        averageResponseRate: averageResponseRate.toFixed(2),
      };
    });

    return tenantReports;
  }
}

module.exports = new ReportService();
