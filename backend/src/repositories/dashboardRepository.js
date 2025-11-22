const {
  Pesquisa,
  Resposta,
  Usuario,
  Tenant,
  Pergunta,
  Cupom,
  Atendente,
  AtendenteMeta,
  Client,
  Criterio,
} = require("../../models");
const { Sequelize, Op } = require("sequelize");
const { now, formatInTimeZone } = require("../utils/dateUtils");
const { startOfMonth } = require("date-fns");

const { fn, col, literal } = Sequelize;

const dashboardRepository = {
  getSummary: async (tenantId = null, startDate = null, endDate = null) => {
    // --- FILTROS ---
    const baseWhere = tenantId ? { tenantId } : {};

    const periodDateFilter = {};
    if (startDate) periodDateFilter[Op.gte] = startDate;
    if (endDate) periodDateFilter[Op.lte] = endDate;
    const periodWhere = { ...baseWhere };
    if (Object.keys(periodDateFilter).length > 0) {
      periodWhere.createdAt = periodDateFilter;
    }

    const now_ = now();
    const startOfCurrentMonth = startOfMonth(now_);
    const monthWhere = {
      ...baseWhere,
      createdAt: { [Op.gte]: startOfCurrentMonth },
    };

    // --- CÁLCULOS NPS (Período Selecionado) ---
    const ratingResponses = await Resposta.findAll({
      where: {
        ...periodWhere,
        ratingValue: { [Op.ne]: null },
      },
      include: [
        {
          model: Pergunta,
          as: "pergunta",
          attributes: ["type"],
          required: true,
        },
      ],
    });

    let npsPromoters = 0,
      npsNeutrals = 0,
      npsDetractors = 0;
    let csatSatisfied = 0,
      csatTotalScore = 0,
      csatCount = 0;

    ratingResponses.forEach((response) => {
      const { ratingValue, pergunta } = response;
      if (!pergunta) return;

      // NPS Calculation
      if (pergunta.type === "rating_0_10") {
        if (ratingValue >= 9) npsPromoters++;
        else if (ratingValue >= 7) npsNeutrals++;
        else npsDetractors++;
      }
      
      // CSAT Calculation (assuming 1-5 scale)
      if (pergunta.type === "rating_1_5" || pergunta.type === "rating") {
        csatTotalScore += ratingValue;
        csatCount++;
        if (ratingValue >= 4) csatSatisfied++; // 4 and 5 are satisfied
      }
    });

    const totalNpsResponses = npsPromoters + npsNeutrals + npsDetractors;
    let npsScore = 0;
    if (totalNpsResponses > 0) {
      const npsPromotersPercentage = (npsPromoters / totalNpsResponses) * 100;
      const npsDetractorsPercentage = (npsDetractors / totalNpsResponses) * 100;
      npsScore = npsPromotersPercentage - npsDetractorsPercentage;
    }

    let csatAverageScore = 0;
    let csatSatisfactionRate = 0;
    if (csatCount > 0) {
        csatAverageScore = csatTotalScore / csatCount;
        csatSatisfactionRate = (csatSatisfied / csatCount) * 100;
    }

    // --- CÁLCULOS (Mês Atual) ---
    const newClientsThisMonthIds = (
      await Client.findAll({
        where: monthWhere,
        attributes: ["id"],
      })
    ).map((c) => c.id);

    const ambassadorsMonth = await Resposta.count({
      distinct: true,
      col: "id",
      where: {
        ...monthWhere,
        ratingValue: { [Op.gte]: 9 }, // Ambassadors are typically promoters (NPS >= 9)
      },
      include: [
        {
          model: Client,
          as: "client",
          where: { id: { [Op.in]: newClientsThisMonthIds } },
          attributes: [],
        },
      ],
    });

    // --- CÁLCULOS (Período Selecionado) ---
    const totalResponsesInPeriod = await Resposta.count({ where: periodWhere });
    const registrationsInPeriod = await Client.count({ where: periodWhere });
    const couponsGeneratedInPeriod = await Cupom.count({ where: periodWhere });
    const couponsUsedInPeriod = await Cupom.count({
      where: {
        ...baseWhere,
        status: "used",
        updatedAt: periodDateFilter,
      },
    });

    // --- CÁLCULOS (Totais) ---
    const totalClients = await Client.count({ where: baseWhere });
    const totalTenants = tenantId ? 1 : await Tenant.count();

    return {
      nps: {
        score: parseFloat(npsScore.toFixed(1)),
        promoters: npsPromoters,
        neutrals: npsNeutrals,
        detractors: npsDetractors,
        total: totalNpsResponses,
      },
      csat: {
        averageScore: parseFloat(csatAverageScore.toFixed(1)),
        satisfactionRate: parseFloat(csatSatisfactionRate.toFixed(1)),
        satisfied: csatSatisfied,
        unsatisfied: csatCount - csatSatisfied,
        total: csatCount,
      },
      registrations: registrationsInPeriod,
      registrationsConversion:
        totalResponsesInPeriod > 0
          ? parseFloat(
              ((registrationsInPeriod / totalResponsesInPeriod) * 100).toFixed(
                2,
              ),
            )
          : 0,
      ambassadorsMonth: ambassadorsMonth,
      couponsGenerated: couponsGeneratedInPeriod,
      couponsGeneratedPeriod:
        startDate && endDate
          ? `${formatInTimeZone(startDate, "dd/MM")} - ${formatInTimeZone(
              endDate,
              "dd/MM",
            )}`
          : "N/A",
      couponsUsed: couponsUsedInPeriod,
      couponsUsedConversion:
        couponsGeneratedInPeriod > 0
          ? parseFloat(
              ((couponsUsedInPeriod / couponsGeneratedInPeriod) * 100).toFixed(
                2,
              ),
            )
          : 0,
      totalResponses: totalResponsesInPeriod,
      totalUsers: totalClients,
      totalTenants,
    };
  },

  getResponseChart: async (
    tenantId = null,
    startDate = null,
    endDate = null,
    period = "day",
  ) => {
    const whereClause = tenantId ? { tenantId } : {};

    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;

    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    const responsesByPeriod = await Resposta.findAll({
      where: whereClause,
      attributes: [
        [fn("date_trunc", period, col("createdAt")), "period"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: [fn("date_trunc", period, col("createdAt"))],
      order: [[fn("date_trunc", period, col("createdAt")), "ASC"]],
    });

    return responsesByPeriod.map((item) => ({
      name: formatInTimeZone(item.dataValues.period, period === "day" ? "dd/MM" : period === "week" ? "ww/yyyy" : "MM/yyyy"),
      Respostas: parseInt(item.dataValues.count),
    }));
  },

  getFeedbacks: async (tenantId = null, startDate = null, endDate = null) => {
    const whereClause = tenantId
      ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: "" } }
      : { textValue: { [Op.ne]: null, [Op.ne]: "" } };
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;

    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    const feedbacksData = await Resposta.findAll({
      where: whereClause,
      attributes: [
        "createdAt",
        "textValue",
        "ratingValue",
        "respondentSessionId",
      ],
      order: [["createdAt", "DESC"]],
      limit: 7,
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["name"],
          foreignKey: "respondentSessionId",
          targetKey: "respondentSessionId",
        },
      ],
    });

    return feedbacksData.map((feedback) => {
      const feedbackItem = {
        date: feedback.createdAt
          ? formatInTimeZone(feedback.createdAt, "dd/MM/yyyy HH:mm")
          : "Data indisponível",
        client: feedback.client ? feedback.client.name : "Anônimo",
        comment: feedback.textValue,
      };
      if (feedback.ratingValue !== null) {
        feedbackItem.nps = feedback.ratingValue;
      }
      return feedbackItem;
    });
  },

  getNpsByCriteria: async (
    tenantId = null,
    startDate = null,
    endDate = null,
  ) => {
    const responseWhereClause = { ratingValue: { [Op.ne]: null } };
    if (tenantId) {
      responseWhereClause.tenantId = tenantId;
    }
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;

    if (Object.keys(dateFilter).length > 0) {
      responseWhereClause.createdAt = dateFilter;
    }

    const npsData = await Criterio.findAll({
      attributes: [
        "id",
        "name",
        [
          fn("SUM", literal(`CASE WHEN "perguntas->respostas"."ratingValue" >= 9 THEN 1 ELSE 0 END`)),
          "promoters",
        ],
        [
          fn("SUM", literal(`CASE WHEN "perguntas->respostas"."ratingValue" <= 6 THEN 1 ELSE 0 END`)),
          "detractors",
        ],
        [fn("COUNT", col("perguntas->respostas.id")), "total"],
      ],
      include: [
        {
          model: Pergunta,
          as: "perguntas",
          attributes: [],
          required: true,
          where: {
            type: { [Op.like]: "rating%" },
          },
          include: [
            {
              model: Resposta,
              as: "respostas",
              attributes: [],
              where: responseWhereClause,
              required: true,
            },
          ],
        },
      ],
      group: ["Criterio.id", "Criterio.name"],
    });

    return npsData.map((item) => {
      const promoters = parseInt(item.dataValues.promoters) || 0;
      const detractors = parseInt(item.dataValues.detractors) || 0;
      const total = parseInt(item.dataValues.total) || 0;
      let nps = 0;
      if (total > 0) {
        nps = (promoters / total) * 100 - (detractors / total) * 100;
      }
      return {
        name: item.name,
        nps: parseFloat(nps.toFixed(1)),
        promoters,
        detractors,
        neutrals: total - promoters - detractors,
        total,
      };
    });
  },

  getNpsDistribution: async (
    tenantId = null,
    startDate = null,
    endDate = null,
  ) => {
    const whereClause = { ratingValue: { [Op.ne]: null } };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    const ratingResponses = await Resposta.findAll({
      where: whereClause,
      include: [
        {
          model: Pergunta,
          as: "pergunta",
          attributes: ["type"],
          required: true,
        },
      ],
    });

    let promoters = 0,
      neutrals = 0,
      detractors = 0;
    ratingResponses.forEach((response) => {
      const { ratingValue, pergunta } = response;
      if (!pergunta) return;
      if (pergunta.type === "rating_0_10") {
        if (ratingValue >= 9) promoters++;
        else if (ratingValue >= 7) neutrals++;
        else detractors++;
      } else if (pergunta.type === "rating_1_5" || pergunta.type === "rating") {
        if (ratingValue === 5) promoters++;
        else if (ratingValue === 4) neutrals++;
        else detractors++;
      }
    });

    return [
      { name: "Promotores", value: promoters },
      { name: "Neutros", value: neutrals },
      { name: "Detratores", value: detractors },
    ];
  },

  getNpsTrendData: async (tenantId = null, period = "day", startDate = null, endDate = null) => {
    const whereClause = { ratingValue: { [Op.ne]: null } };
    if (tenantId) {
        whereClause.tenantId = tenantId;
    }

    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;
    if (Object.keys(dateFilter).length > 0) {
        whereClause.createdAt = dateFilter;
    }

    const trendData = await Resposta.findAll({
        where: whereClause,
        attributes: [
            [fn("date_trunc", period, col("createdAt")), "period"],
            [fn("SUM", literal(`CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END`)), "promoters"],
            [fn("SUM", literal(`CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END`)), "detractors"],
            [fn("COUNT", col("id")), "total"],
        ],
        group: [fn("date_trunc", period, col("createdAt"))],
        order: [[fn("date_trunc", period, col("createdAt")), "ASC"]],
    });

    return trendData.map((item) => {
        const data = item.dataValues;
        const promoters = parseInt(data.promoters) || 0;
        const detractors = parseInt(data.detractors) || 0;
        const total = parseInt(data.total) || 0;
        let nps = 0;
        if (total > 0) {
            nps = (promoters / total) * 100 - (detractors / total) * 100;
        }
        return {
            period: formatInTimeZone(data.period, 'dd/MM'),
            nps: parseFloat(nps.toFixed(1)),
        };
    });
  },

  getConversionChartData: async (tenantId = null, startDate = null, endDate = null) => {
    const whereClause = {};
    if (tenantId) whereClause.tenantId = tenantId;

    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;
    if (Object.keys(dateFilter).length > 0) {
        whereClause.createdAt = dateFilter;
    }

    const totalResponses = await Resposta.count({ where: whereClause });
    const totalRegistrations = await Client.count({ where: whereClause });
    const couponsGenerated = await Cupom.count({ where: whereClause });
    
    // Para cupons utilizados, o filtro de data deve ser no `updatedAt`
    const usedWhereClause = { tenantId, status: 'used' };
    const usedDateFilter = {};
    if (startDate) usedDateFilter[Op.gte] = startDate;
    if (endDate) usedDateFilter[Op.lte] = endDate;
    if (Object.keys(usedDateFilter).length > 0) {
        usedWhereClause.updatedAt = usedDateFilter;
    }
    const couponsUsed = await Cupom.count({ where: usedWhereClause });

    return [
        { name: 'Respostas', value: totalResponses },
        { name: 'Cadastros', value: totalRegistrations },
        { name: 'Cupons Gerados', value: couponsGenerated },
        { name: 'Cupons Utilizados', value: couponsUsed },
    ];
  },

  getWordCloudData: async (tenantId = null, startDate = null, endDate = null) => {
    const whereClause = {
      textValue: { [Op.ne]: null, [Op.ne]: "" },
    };
    if (tenantId) {
        whereClause.tenantId = tenantId;
    }
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    const responses = await Resposta.findAll({
      where: whereClause,
      attributes: ["textValue"],
    });

    if (!responses.length) {
      return [];
    }

    const stopwords = new Set([
        "de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "com", "não", "uma", "os", "no", "na", "por", "mais", "as", "dos", "como", "mas", "foi", "ao", "ele", "das", "tem", "à", "seu", "sua", "ou", "ser", "quando", "muito", "há", "nos", "já", "está", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem", "nas", "me", "esse", "eles", "estão", "você", "tinha", "foram", "essa", "num", "nem", "suas", "meu", "às", "minha", "têm", "numa", "pelos", "elas", "havia", "seja", "qual", "será", "nós", "tenho", "lhe", "deles", "essas", "esses", "pelas", "este", "fosse", "dele", "tu", "te", "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", "nossa", "nossos", "nossas", "dela", "delas", "esta", "estes", "estas", "aquele", "aquela", "aqueles", "aquelas", "isto", "aquilo", "estou", "está", "estamos", "estão", "estive", "esteve", "estivemos", "estiveram", "estava", "estávamos", "estavam", "estivera", "estivéramos", "esteja", "estejamos", "estejam", "estivesse", "estivéssemos", "estivessem", "estiver", "estivermos", "estiverem", "hei", "há", "havemos", "hão", "houve", "houvemos", "houveram", "houvera", "houvéramos", "haja", "hajamos", "hajam", "houvesse", "houvéssemos", "houvessem", "houver", "houvermos", "houverem", "houverei", "houverá", "houveremos", "houverão", "houveria", "houveríamos", "houveriam", "sou", "somos", "são", "era", "éramos", "eram", "fui", "foi", "fomos", "foram", "fora", "fôramos", "seja", "sejamos", "sejam", "fosse", "fôssemos", "fossem", "for", "formos", "forem", "serei", "será", "seremos", "serão", "seria", "seríamos", "seriam", "bom", "ótimo", "excelente", "gostei", "muito", "atendimento", "comida"
    ]);

    const wordCounts = {};
    responses.forEach(response => {
      const words = response.textValue
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/);
        
      words.forEach(word => {
        if (word && !stopwords.has(word) && word.length > 2) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });

    return Object.entries(wordCounts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 100); // Limita a 100 palavras
  },

  getNpsByDayOfWeek: async (tenantId = null, startDate = null, endDate = null) => {
    const whereClause = { ratingValue: { [Op.ne]: null } };
    if (tenantId) {
        whereClause.tenantId = tenantId;
    }

    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;
    if (Object.keys(dateFilter).length > 0) {
        whereClause.createdAt = dateFilter;
    }

    const npsData = await Resposta.findAll({
        where: whereClause,
        attributes: [
            [Sequelize.fn('EXTRACT', Sequelize.literal('DOW FROM "Resposta"."createdAt"')), 'dayOfWeek'], // DOW = Day Of Week (0=Sunday, 1=Monday...)
            [fn("SUM", literal(`CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END`)), "promoters"],
            [fn("SUM", literal(`CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END`)), "detractors"],
            [fn("COUNT", col("id")), "total"],
        ],
        group: [Sequelize.fn('EXTRACT', Sequelize.literal('DOW FROM "Resposta"."createdAt"'))],
        order: [[Sequelize.fn('EXTRACT', Sequelize.literal('DOW FROM "Resposta"."createdAt"')), 'ASC']],
    });

    const daysOfWeekNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    return npsData.map(item => {
        const data = item.dataValues;
        const promoters = parseInt(data.promoters) || 0;
        const detractors = parseInt(data.detractors) || 0;
        const total = parseInt(data.total) || 0;
        let nps = 0;
        if (total > 0) {
            nps = (promoters / total) * 100 - (detractors / total) * 100;
        }
        return {
            dayOfWeek: daysOfWeekNames[data.dayOfWeek],
            nps: parseFloat(nps.toFixed(1)),
        };
    });
  },

  getAttendantsPerformance: async (tenantId, startDate, endDate) => {
    const whereClause = { tenantId };
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    const attendants = await Atendente.findAll({
      where: { tenantId, status: 'active' },
      include: [{
        model: AtendenteMeta,
        as: 'meta'
      }]
    });

    const performanceData = [];
    for (const attendant of attendants) {
      const responses = await Resposta.findAll({
        where: { ...whereClause, atendenteId: attendant.id }
      });

      const ratingResponses = responses.filter(r => r.ratingValue !== null);
      let promoters = 0;
      let detractors = 0;
      ratingResponses.forEach(r => {
        if (r.ratingValue >= 9) promoters++;
        else if (r.ratingValue <= 6) detractors++;
      });

      const totalResponses = responses.length;
      const nps = totalResponses > 0 ? ((promoters / totalResponses) * 100) - ((detractors / totalResponses) * 100) : 0;
      
      const uniqueRespondentIds = [...new Set(responses.map(r => r.respondentSessionId))];
      const registrations = uniqueRespondentIds.length;

      performanceData.push({
        id: attendant.id,
        name: attendant.name,
        nps: parseFloat(nps.toFixed(1)),
        npsGoal: attendant.meta ? parseFloat(attendant.meta.npsGoal) : 0,
        responses: totalResponses,
        responsesGoal: attendant.meta ? attendant.meta.responsesGoal : 0,
        registrations: registrations,
        registrationsGoal: attendant.meta ? attendant.meta.registrationsGoal : 0,
      });
    }
    return performanceData;
  },
  
  getMainDashboard: async (
    tenantId = null,
    startDate = null,
    endDate = null,
    period = "day", // Adicionando o parâmetro period
  ) => {
    const [
      summary,
      responseChart,
      npsTrend,
      npsDistribution,
      npsByCriteria,
      feedbacks,
      attendantsPerformance,
      wordCloud,
      conversionChart,
      npsByDayOfWeek, // Adicionando aqui
    ] = await Promise.all([
      dashboardRepository.getSummary(tenantId, startDate, endDate),
      dashboardRepository.getResponseChart(tenantId, startDate, endDate, period), // Repassando o period
      dashboardRepository.getNpsTrendData(
        tenantId,
        period, // Repassando o period
        startDate,
        endDate,
      ),
      dashboardRepository.getNpsDistribution(tenantId, startDate, endDate),
      dashboardRepository.getNpsByCriteria(tenantId, startDate, endDate),
      dashboardRepository.getFeedbacks(tenantId, startDate, endDate),
      dashboardRepository.getAttendantsPerformance(tenantId, startDate, endDate),
      dashboardRepository.getWordCloudData(tenantId, startDate, endDate),
      dashboardRepository.getConversionChartData(tenantId, startDate, endDate),
      dashboardRepository.getNpsByDayOfWeek(tenantId, startDate, endDate), // Adicionando a chamada
    ]);

    // Adaptar a estrutura de dados para o que o frontend espera
    const dashboardData = {
      summary,
      responseChart,
      npsTrend,
      npsDistribution,
      feedbacks,
      attendantsPerformance,
      wordCloud,
      conversionChart,
      npsByDayOfWeek, // Adicionando aqui
      criteriaScores: npsByCriteria.map(item => ({ // Adicionando criteriaScores aqui
        criterion: item.name,
        npsScore: item.nps,
        scoreType: 'NPS',
        promoters: item.promoters,
        neutrals: item.neutrals,
        detractors: item.detractors,
        total: item.total,
      })),
      overallResults: { // Manter overallResults para o DashboardPage.js
        scoresByCriteria: npsByCriteria.map(item => ({
          criterion: item.name,
          npsScore: item.nps,
          scoreType: 'NPS',
          promoters: item.promoters,
          neutrals: item.neutrals,
          detractors: item.detractors,
          total: item.total,
        }))
      },
      demographics: { // Adicionando objeto demographics vazio para evitar crash no frontend
        ageDistribution: [],
        genderDistribution: [],
      }
    };

    return dashboardData;
  },
};

module.exports = dashboardRepository;