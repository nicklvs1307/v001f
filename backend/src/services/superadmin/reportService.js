const { Tenant, Usuario, Campanha, Pesquisa, WhatsappSender, Client, Resposta, sequelize } = require('../../../models');
const { Op } = require('sequelize');

class ReportService {

  async getSuperAdminDashboard() {
    const totalTenants = await Tenant.count();
    const totalUsers = await Usuario.count();
    const totalSurveys = await Pesquisa.count();

    const userGrowth = await Usuario.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['month'],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });

    // This is a placeholder for plans, as there is no plan information in the tenant model
    const tenantsByPlan = [
        { name: 'Básico', value: totalTenants },
        { name: 'Pro', value: 0 },
        { name: 'Enterprise', value: 0 },
    ];

    return {
      totalTenants,
      totalUsers,
      totalSurveys,
      userGrowth: userGrowth.map(item => ({
        name: new Date(item.month).toLocaleString('default', { month: 'short' }),
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
      attributes: ['status', [Tenant.sequelize.fn('COUNT', Tenant.sequelize.col('status')), 'count']],
      group: ['status'],
    });

    return {
      totalTenants,
      totalUsers,
      totalCampaigns,
      senderPoolStatus: senderPoolStatus.map(s => ({ status: s.status, count: s.dataValues.count })),
    };
  }

  async getTenantReports() {
    const tenants = await Tenant.findAll({
      attributes: ['id', 'name'],
    });

    const tenantReports = await Promise.all(tenants.map(async (tenant) => {
      const activeClients = await Client.count({ where: { tenantId: tenant.id } });
      const activeCampaigns = await Campanha.count({ where: { tenantId: tenant.id, status: { [Op.in]: ['processing', 'scheduled'] } } });
      const totalSurveys = await Pesquisa.count({ where: { tenantId: tenant.id } });

      const totalResponses = await Resposta.count({ where: { tenantId: tenant.id } });
      const totalSurveyClients = await Client.count({
        where: { tenantId: tenant.id },
        include: [{
          model: Resposta,
          as: 'respostas',
          attributes: [],
          required: true,
        }],
        distinct: true,
      });
      const averageResponseRate = totalSurveys > 0 ? (totalResponses / totalSurveys) : 0;


      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        activeClients,
        activeCampaigns,
        totalSurveys,
        averageResponseRate: averageResponseRate.toFixed(2),
      };
    }));

    return tenantReports;
  }
}

module.exports = new ReportService();
