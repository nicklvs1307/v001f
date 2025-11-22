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

    let promoters = 0,
      neutrals = 0,
      detractors = 0;
    ratingResponses.forEach((response) => {
      const { ratingValue, pergunta } = response;
      if (!pergunta) return;

      if (pergunta.type === "rating_1_5" || pergunta.type === "rating") {
        if (ratingValue === 5) promoters++;
        else if (ratingValue === 4) neutrals++;
        else detractors++;
      } else if (pergunta.type === "rating_0_10") {
        if (ratingValue >= 9) promoters++;
        else if (ratingValue >= 7) neutrals++;
        else detractors++;
      }
    });

    const totalRatingResponses = ratingResponses.length;
    let npsScore = 0,
      promotersPercentage = 0,
      neutralsPercentage = 0,
      detractorsPercentage = 0;
    if (totalRatingResponses > 0) {
      promotersPercentage = (promoters / totalRatingResponses) * 100;
      neutralsPercentage = (neutrals / totalRatingResponses) * 100;
      detractorsPercentage = (detractors / totalRatingResponses) * 100;
      npsScore = promotersPercentage - detractorsPercentage;
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
        ratingValue: { [Op.gte]: 9 },
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
      npsScore: parseFloat(npsScore.toFixed(1)),
      promoters,
      promotersPercentage: parseFloat(promotersPercentage.toFixed(2)),
      neutrals,
      neutralsPercentage: parseFloat(neutralsPercentage.toFixed(2)),
      detractors,
      detractorsPercentage: parseFloat(detractorsPercentage.toFixed(2)),
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
  ) => {
    const whereClause = tenantId ? { tenantId } : {};

    const { dateFilter, daysInRange, start } = (() => {
      if (startDate && endDate) {
        const startDt = new Date(startDate);
        const endDt = new Date(endDate);
        const diffTime = Math.abs(endDt - startDt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return {
          dateFilter: { [Op.gte]: startDt, [Op.lte]: endDt },
          daysInRange: diffDays,
          start: startDt,
        };
      } else {
        const endDt = now();
        const startDt = now();
        startDt.setDate(startDt.getDate() - 6);
        return {
          dateFilter: { [Op.gte]: startDt, [Op.lte]: endDt },
          daysInRange: 7,
          start: startDt,
        };
      }
    })();

    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    const responsesByDay = await Resposta.findAll({
      where: whereClause,
      attributes: [
        [fn("date_trunc", "day", col("createdAt")), "date"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: [fn("date_trunc", "day", col("createdAt"))],
      order: [[fn("date_trunc", "day", col("createdAt")), "ASC"]],
    });

    const chartData = [];
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const responseMap = new Map(
      responsesByDay.map((item) => [
        formatInTimeZone(item.dataValues.date, "yyyy-MM-dd"),
        parseInt(item.dataValues.count),
      ]),
    );

    for (let i = 0; i < daysInRange; i++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + i);
      const dayName = daysOfWeek[date.getUTCDay()];
      const formattedDate = formatInTimeZone(date, "yyyy-MM-dd");

      chartData.push({
        name: dayName,
        Respostas: responseMap.get(formattedDate) || 0,
      });
    }

    return chartData;
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
    ] = await Promise.all([
      dashboardRepository.getSummary(tenantId, startDate, endDate),
      dashboardRepository.getResponseChart(tenantId, startDate, endDate),
      dashboardRepository.getNpsTrendData(
        tenantId,
        "day",
        startDate,
        endDate,
      ),
      dashboardRepository.getNpsDistribution(tenantId, startDate, endDate),
      dashboardRepository.getNpsByCriteria(tenantId, startDate, endDate),
      dashboardRepository.getFeedbacks(tenantId, startDate, endDate),
      dashboardRepository.getAttendantsPerformance(tenantId, startDate, endDate),
      dashboardRepository.getWordCloudData(tenantId, startDate, endDate),
      dashboardRepository.getConversionChartData(tenantId, startDate, endDate),
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
      overallResults: {
        scoresByCriteria: npsByCriteria.map(item => ({
          criterion: item.name,
          npsScore: item.nps,
          scoreType: 'NPS',
          // Incluindo outros campos que o frontend pode esperar, mesmo que não sejam usados no cálculo principal
          promoters: item.promoters,
          neutrals: item.neutrals,
          detractors: item.detractors,
          total: item.total,
        }))
      },
    };

    return dashboardData;
  },
};

module.exports = dashboardRepository;