const { Client } = require('../../models');
const { Op, fn, col, where, literal } = require('sequelize');

class ClientRepository {
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
          sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "birthDate"')), month),
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
    });

    return { clients: rows, total: count };
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