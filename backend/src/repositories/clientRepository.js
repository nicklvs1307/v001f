const { Client } = require('../../models');
const { Op } = require('sequelize');
const ApiError = require("../errors/ApiError");

class ClientRepository {
  async findCuriosos(tenantId) {
    return Client.findAll({
      where: { tenantId },
      include: [{
        model: Resposta,
        as: 'respostas',
        attributes: [],
      }],
      attributes: {
        include: [[sequelize.fn('COUNT', sequelize.col('respostas.id')), 'visitCount']],
      },
      group: ['Client.id'],
      having: sequelize.literal('COUNT(respostas.id) = 0'),
    });
  }

  async findInativos(tenantId) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return Client.findAll({
      where: { tenantId },
      include: [{
        model: Resposta,
        as: 'respostas',
        attributes: [],
      }],
      attributes: {
        include: [[sequelize.fn('MAX', sequelize.col('respostas.createdAt')), 'lastVisit']],
      },
      group: ['Client.id'],
      having: sequelize.literal(`MAX("respostas"."createdAt") < '${threeMonthsAgo.toISOString()}' AND COUNT("respostas"."id") > 0`),
    });
  }

  async findNovatos(tenantId) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return Client.findAll({
      where: { tenantId },
      include: [{
        model: Resposta,
        as: 'respostas',
        where: { createdAt: { [Op.gte]: threeMonthsAgo } },
        attributes: [],
      }],
      attributes: {
        include: [[sequelize.fn('COUNT', sequelize.col('respostas.id')), 'visitCount']],
      },
      group: ['Client.id'],
      having: sequelize.literal('COUNT(respostas.id) = 1'),
    });
  }

  async findFieis(tenantId) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return Client.findAll({
      where: { tenantId },
      include: [{
        model: Resposta,
        as: 'respostas',
        where: { createdAt: { [Op.gte]: threeMonthsAgo } },
        attributes: [],
      }],
      attributes: {
        include: [[sequelize.fn('COUNT', sequelize.col('respostas.id')), 'visitCount']],
      },
      group: ['Client.id'],
      having: sequelize.literal('COUNT(respostas.id) BETWEEN 2 AND 4'),
    });
  }

  async findSuperClientes(tenantId) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return Client.findAll({
      where: { tenantId },
      include: [{
        model: Resposta,
        as: 'respostas',
        where: { createdAt: { [Op.gte]: threeMonthsAgo } },
        attributes: [],
      }],
      attributes: {
        include: [[sequelize.fn('COUNT', sequelize.col('respostas.id')), 'visitCount']],
      },
      group: ['Client.id'],
      having: sequelize.literal('COUNT(respostas.id) >= 5'),
    });
  }

  async findByTenant(tenantId) {
    return Client.findAll({ where: { tenantId } });
  }

  async findByIds(clientIds, tenantId) {
    return Client.findAll({
      where: {
        id: { [Op.in]: clientIds },
        tenantId,
      },
    });
  }

  async findByBirthMonth(month, tenantId) {
    // Cuidado: esta query pode ser lenta em bancos de dados grandes sem um índice no mês de aniversário.
    return Client.findAll({
      where: {
        [Op.and]: [
          where(fn('EXTRACT', literal('MONTH FROM "birthDate"')), month),
          { tenantId },
        ],
      },
    });
  }

  async getClientByRespondentSessionId(respondentSessionId) {
    return Client.findOne({ where: { respondentSessionId } });
  }

  async createClient(clientData, options = {}) {
    return Client.create(clientData, options);
  }

  async updateClient(id, clientData, tenantId, options = {}) {
    const client = await this.getClientById(id, tenantId);
    if (client) {
      return client.update(clientData, options);
    }
    return null;
  }

  async getClientById(id, tenantId = null) {
    const whereClause = { id };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    return Client.findOne({ where: whereClause });
  }

  async deleteClient(id, tenantId) {
    return Client.destroy({ where: { id, tenantId } });
  }

  async findClientByEmail(email) {
    return Client.findOne({ where: { email } });
  }

  async findClientByPhone(phone) {
    return Client.findOne({ where: { phone } });
  }

  async findAndCountAllByTenant(tenantId, page, limit, orderBy, order, filter) {
    const offset = (page - 1) * limit;
    const whereClause = { tenantId };

    if (filter) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${filter}%` } },
        { email: { [Op.iLike]: `%${filter}%` } },
        { phone: { [Op.iLike]: `%${filter}%` } },
      ];
    }

    const { count, rows } = await Client.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[orderBy, order.toUpperCase()]],
      attributes: {
        include: [
          [
            literal(`(
              SELECT MAX("createdAt")
              FROM "respostas" AS "r"
              WHERE "r"."respondentSessionId" = "Client"."respondentSessionId"
            )`),
            'lastVisit'
          ]
        ]
      },
      group: ['Client.id'], // Agrupar para garantir que a contagem seja correta
    });

    // A contagem pode ser um array de objetos por causa do group. Precisamos somar.
    const total = count.reduce((acc, item) => acc + parseInt(item.count, 10), 0);

    return { clients: rows, total };
  }

  async getClientDetails(clientId, tenantId) {
    const client = await Client.findOne({
      where: { id: clientId, tenantId },
      include: [
        {
          model: require('../../models').Cupom,
          as: 'cupons',
          include: [{
            model: require('../../models').Recompensa,
            as: 'recompensa'
          }]
        },
        {
          model: require('../../models').Resposta,
          as: 'respostas',
          attributes: ['createdAt'],
        }
      ]
    });

    if (!client) {
      return null;
    }

    const clientJSON = client.toJSON();

    // Processar cupons
    const cupons = clientJSON.cupons || [];
    const activeCoupons = cupons.filter(c => c.status === 'active');
    const usedCoupons = cupons.filter(c => c.status === 'used');

    // Processar visitas
    const visits = clientJSON.respostas || [];
    const totalVisits = new Set(visits.map(v => new Date(v.createdAt).toDateString())).size;
    const lastVisit = visits.length > 0 ? new Date(Math.max(...visits.map(v => new Date(v.createdAt)))) : null;

    // Gráfico de comparecimento (visitas por mês)
    const attendance = visits.reduce((acc, visit) => {
      const month = new Date(visit.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const attendanceData = Object.keys(attendance).map(month => ({
      month,
      visits: attendance[month]
    }));

    return {
      ...clientJSON,
      cupons: undefined, // remover para não duplicar
      respostas: undefined, // remover para não duplicar
      stats: {
        totalVisits,
        lastVisit,
        activeCoupons,
        usedCoupons,
        attendanceData,
      }
    };
  }

  async getClientDashboardData(tenantId) {
    const whereClause = { tenantId };

    // 1. Total de Clientes
    const totalClients = await Client.count({ where: whereClause });

    // 2. Aniversariantes do Mês
    const currentMonth = new Date().getMonth() + 1;
    const birthdayCount = await Client.count({
      where: {
        ...whereClause,
        [Op.and]: [
          where(fn('EXTRACT', literal('MONTH FROM "birthDate"')), currentMonth),
        ],
      },
    });

    const clients = await Client.findAll({ where: whereClause, attributes: ['birthDate', 'gender'], raw: true });

    // 3. Média de Idade
    let totalAge = 0;
    let clientsWithAge = 0;
    const currentYear = new Date().getFullYear();
    clients.forEach(client => {
        if (client.birthDate) {
            const birthYear = new Date(client.birthDate).getFullYear();
            totalAge += currentYear - birthYear;
            clientsWithAge++;
        }
    });
    const averageAge = clientsWithAge > 0 ? Math.round(totalAge / clientsWithAge) : 0;

    // 4. Distribuição por Faixa Etária
    const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0, 'N/A': 0 };
    clients.forEach(client => {
        if (client.birthDate) {
            const age = currentYear - new Date(client.birthDate).getFullYear();
            if (age >= 18 && age <= 24) ageGroups['18-24']++;
            else if (age >= 25 && age <= 34) ageGroups['25-34']++;
            else if (age >= 35 && age <= 44) ageGroups['35-44']++;
            else if (age >= 45 && age <= 54) ageGroups['45-54']++;
            else if (age >= 55) ageGroups['55+']++;
            else ageGroups['N/A']++;
        } else {
            ageGroups['N/A']++;
        }
    });
    const ageDistribution = Object.entries(ageGroups).map(([name, count]) => ({ name, count }));

    // 5. Distribuição por Gênero
    const genderCounts = {};
    clients.forEach(client => {
        const gender = client.gender || 'Não informado';
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });
    const genderDistribution = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));

    return {
        totalClients,
        birthdayCount,
        averageAge,
        ageDistribution,
        genderDistribution,
    };
  }
}

module.exports = new ClientRepository();