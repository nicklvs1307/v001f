const { Client, Cupom, Resposta, CampanhaLog, sequelize } = require("../../models");
const { Op } = require("sequelize");
const { now, formatInTimeZone } = require("../utils/dateUtils");
const { calculateAgeDistribution, calculateGenderDistribution } = require("../utils/demographicsUtils");
const ApiError = require("../errors/ApiError");

class ClientRepository {
  async findClientsByBirthdayMonthAndDay(month, day, tenantId) {
    return Client.findAll({
      where: {
        tenantId,
        [Op.and]: [
          sequelize.where(
            sequelize.fn(
              "EXTRACT",
              sequelize.literal('MONTH FROM "birthDate"'),
            ),
            month,
          ),
          sequelize.where(
            sequelize.fn("EXTRACT", sequelize.literal('DAY FROM "birthDate"')),
            day,
          ),
        ],
      },
      attributes: ["id", "name", "phone", "birthDate"],
      raw: true,
    });
  }

  async findCuriosos(tenantId) {
    return Client.findAll({
      where: { tenantId },
      include: [
        {
          model: Resposta,
          as: "respostas",
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("respostas.id")), "visitCount"],
        ],
      },
      group: ["Client.id"],
      having: sequelize.literal("COUNT(respostas.id) = 0"),
    });
  }

  async findInativos(tenantId) {
    const threeMonthsAgo = now();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return Client.findAll({
      where: { tenantId },
      include: [
        {
          model: Resposta,
          as: "respostas",
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.fn("MAX", sequelize.col("respostas.createdAt")),
            "lastVisit",
          ],
        ],
      },
      group: ["Client.id"],
      having: sequelize.literal(
        `MAX("respostas"."createdAt") < '${threeMonthsAgo.toISOString()}' AND COUNT("respostas"."id") > 0`,
      ),
    });
  }

  async findNovatos(tenantId) {
    const threeMonthsAgo = now();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return Client.findAll({
      where: { tenantId },
      include: [
        {
          model: Resposta,
          as: "respostas",
          where: { createdAt: { [Op.gte]: threeMonthsAgo } },
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("respostas.id")), "visitCount"],
        ],
      },
      group: ["Client.id"],
      having: sequelize.literal("COUNT(respostas.id) = 1"),
    });
  }

  async findFieis(tenantId) {
    const threeMonthsAgo = now();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return Client.findAll({
      where: { tenantId },
      include: [
        {
          model: Resposta,
          as: "respostas",
          where: { createdAt: { [Op.gte]: threeMonthsAgo } },
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("respostas.id")), "visitCount"],
        ],
      },
      group: ["Client.id"],
      having: sequelize.literal("COUNT(respostas.id) BETWEEN 2 AND 4"),
    });
  }

  async findSuperClientes(tenantId) {
    const threeMonthsAgo = now();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return Client.findAll({
      where: { tenantId },
      include: [
        {
          model: Resposta,
          as: "respostas",
          where: { createdAt: { [Op.gte]: threeMonthsAgo } },
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("respostas.id")), "visitCount"],
        ],
      },
      group: ["Client.id"],
      having: sequelize.literal("COUNT(respostas.id) >= 5"),
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

  async findBirthdayClients(tenantId, { month, searchTerm }) {
    const whereClause = { tenantId };
    const currentYear = new Date().getFullYear();

    if (month && month !== 'all') {
        whereClause[Op.and] = [
            sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "birthDate"')), month)
        ];
    }

    if (searchTerm) {
        whereClause[Op.or] = [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { email: { [Op.iLike]: `%${searchTerm}%` } },
            { phone: { [Op.iLike]: `%${searchTerm}%` } }
        ];
    }

    // A associação agora está definida estaticamente no modelo Client
    return Client.findAll({
        where: whereClause,
        include: [
            {
                model: CampanhaLog,
                as: 'campanhaLogs',
                required: false, // LEFT JOIN
                where: {
                    variant: `birthday-automation-${currentYear}`
                },
                attributes: []
            }
        ],
        attributes: {
            include: [
                [
                    sequelize.literal(`(CASE WHEN "campanhaLogs"."id" IS NOT NULL THEN TRUE ELSE FALSE END)`),
                    'messageSent'
                ]
            ]
        },
        order: [
            [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "birthDate"')), 'ASC'],
            [sequelize.fn('EXTRACT', sequelize.literal('DAY FROM "birthDate"')), 'ASC']
        ],
        subQuery: false,
        group: ['Client.id', 'campanhaLogs.id'] // Adicionar group by para evitar duplicatas
    });
  }

  async getClientByRespondentSessionId(respondentSessionId, options = {}) {
    return Client.findOne({ where: { respondentSessionId }, ...options });
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

  async findClientByEmail(email, tenantId, options = {}) {
    return Client.findOne({ where: { email, tenantId }, ...options });
  }

  async findClientByPhone(phone, tenantId, options = {}) {
    return Client.findOne({ where: { phone, tenantId }, ...options });
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
            sequelize.literal(`(
              SELECT MAX("createdAt")
              FROM "respostas" AS "r"
              WHERE "r"."respondentSessionId" = "Client"."respondentSessionId"
            )`),
            "lastVisit",
          ],
        ],
      },
      group: ["Client.id"], // Agrupar para garantir que a contagem seja correta
    });

    // A contagem pode ser um array de objetos por causa do group. Precisamos somar.
    const total = count.reduce(
      (acc, item) => acc + parseInt(item.count, 10),
      0,
    );

    return { clients: rows, total };
  }

  async getClientDetails(clientId, tenantId) {
    const client = await Client.findOne({
      where: { id: clientId, tenantId },
      include: [
        {
          model: require("../../models").Cupom,
          as: "cupons",
          include: [
            {
              model: require("../../models").Recompensa,
              as: "recompensa",
            },
          ],
        },
        {
          model: require("../../models").Resposta,
          as: "respostas",
          attributes: ["createdAt"],
        },
        {
          model: require("../../models").DeliveryOrder,
          as: "deliveryOrders",
          order: [['orderDate', 'DESC']],
        }
      ],
      order: [
        [{ model: require("../../models").DeliveryOrder, as: 'deliveryOrders' }, 'orderDate', 'DESC']
      ]
    });

    if (!client) {
      return null;
    }

    const clientJSON = client.toJSON();

    // Processar cupons
    const cupons = clientJSON.cupons || [];
    const activeCoupons = cupons.filter((c) => c.status === "active");
    const usedOrExpiredCoupons = cupons.filter(
      (c) => c.status === "used" || c.status === "expired",
    );

    // Processar visitas (respostas a pesquisas)
    const visits = clientJSON.respostas || [];
    const totalVisits = visits.length;
    const lastVisit =
      visits.length > 0
        ? new Date(Math.max(...visits.map((v) => new Date(v.createdAt))))
        : null;

    // Gráfico de comparecimento (visitas por mês)
    const attendance = visits.reduce((acc, visit) => {
      const month = formatInTimeZone(visit.createdAt, "MMMM yyyy");
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const attendanceData = Object.keys(attendance).map((month) => ({
      month,
      visits: attendance[month],
    }));

    // Processar Pedidos de Delivery
    const deliveryOrders = clientJSON.deliveryOrders || [];
    const totalOrders = deliveryOrders.length;
    const totalSpent = deliveryOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
    const lastOrders = deliveryOrders.slice(0, 5);

    // Processar Preferências a partir dos pedidos
    const productCounts = {};
    const categoryCounts = {};

    deliveryOrders.forEach(order => {
      const payload = order.payload;
      if (payload && Array.isArray(payload.produtos)) {
        payload.produtos.forEach(produto => {
          if (produto.produto) {
            productCounts[produto.produto] = (productCounts[produto.produto] || 0) + (produto.quantidade || 1);
          }
          if (produto.categoria) {
            categoryCounts[produto.categoria] = (categoryCounts[produto.categoria] || 0) + (produto.quantidade || 1);
          }
        });
      }
    });

    const topProducts = Object.entries(productCounts)
                              .sort(([,a],[,b]) => b - a)
                              .slice(0, 5)
                              .map(([name, count]) => ({ name, count }));

    const topCategories = Object.entries(categoryCounts)
                                .sort(([,a],[,b]) => b - a)
                                .slice(0, 5)
                                .map(([name, count]) => ({ name, count }));

    return {
      ...clientJSON,
      cupons: undefined, 
      respostas: undefined, 
      deliveryOrders: undefined,
      stats: {
        totalVisits,
        lastVisit,
        activeCoupons,
        usedOrExpiredCoupons,
        attendanceData,
        totalOrders,
        totalSpent,
        lastOrders,
        preferences: {
          topProducts,
          topCategories,
        },
      },
    };
  }

  async getClientDashboardData(tenantId) {
    const whereClause = { tenantId };

    // 1. Total de Clientes
    const totalClients = await Client.count({ where: whereClause });

    // 2. Aniversariantes do Mês
    const currentMonth = now().getMonth() + 1;
    const birthdayCount = await Client.count({
      where: {
        ...whereClause,
        [Op.and]: [
          sequelize.where(
            sequelize.fn(
              "EXTRACT",
              sequelize.literal('MONTH FROM "birthDate" AT TIME ZONE \'UTC\''),
            ),
            currentMonth,
          ),
        ],
      },
    });

    const clients = await Client.findAll({
      where: whereClause,
      attributes: ["birthDate", "gender"],
      raw: true,
    });

    // 3. Média de Idade
    const clientsWithBirthDate = clients.filter(c => c.birthDate);
    const totalAge = clientsWithBirthDate.reduce((sum, client) => {
        const birthYear = new Date(client.birthDate).getFullYear();
        return sum + (now().getFullYear() - birthYear);
    }, 0);
    const averageAge =
      clientsWithBirthDate.length > 0 ? Math.round(totalAge / clientsWithBirthDate.length) : 0;

    // 4. & 5. Distribuição por Faixa Etária e Gênero usando o utilitário
    const ageDistributionData = calculateAgeDistribution(clients);
    const ageDistribution = Object.entries(ageDistributionData).map(([name, count]) => ({
      name,
      count,
    }));
    
    const genderDistributionData = calculateGenderDistribution(clients);
    const genderDistribution = Object.entries(genderDistributionData).map(
      ([name, value]) => ({ name, value }),
    );

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
