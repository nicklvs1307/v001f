const { Tenant, Usuario, Campanha, Pesquisa, WhatsappSender, Client, Resposta } = require('../../../models');
const { Op } = require('sequelize');

class ReportService {
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
      const activeClients = await Client.count({ where: { tenantId: tenant.id, status: 'active' } });
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
