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

const getSummary = async (tenantId = null, startDate = null, endDate = null) => {
  // --- FILTROS ---
  const baseWhere = tenantId ? { tenantId } : {};

  const periodDateFilter = {};
  if (startDate) periodDateFilter[Op.gte] = startDate;
  if (endDate) periodDateFilter[Op.lte] = endDate;

  const periodWhere = { ...baseWhere };
  if (Object.keys(periodDateFilter).length > 0) {
    periodWhere.createdAt = periodDateFilter;
  }

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
    csatNeutrals = 0,
    csatUnsatisfied = 0,
    csatTotalScore = 0,
    csatCount = 0;

  ratingResponses.forEach((response) => {
    const { ratingValue, pergunta } = response;
    if (!pergunta) return;

    if (pergunta.type === "rating_0_10") {
      if (ratingValue >= 9) npsPromoters++;
      else if (ratingValue >= 7) npsNeutrals++;
      else npsDetractors++;
    }
    
    if (pergunta.type === "rating_1_5" || pergunta.type === "rating") {
      csatTotalScore += ratingValue;
      csatCount++;
      if (ratingValue >= 4) {
          csatSatisfied++;
      } else if (ratingValue === 3) {
          csatNeutrals++;
      } else {
          csatUnsatisfied++;
      }
    }
  });

  const totalNpsResponses = npsPromoters + npsNeutrals + npsDetractors;
  let npsScore = 0;
  if (totalNpsResponses > 0) {
    npsScore = ((npsPromoters - npsDetractors) / totalNpsResponses) * 100;
  }

  let csatAverageScore = 0;
  let csatSatisfactionRate = 0;
  if (csatCount > 0) {
      csatAverageScore = csatTotalScore / csatCount;
      csatSatisfactionRate = (csatSatisfied / csatCount) * 100;
  }

  const uniquePromoterClientsInPeriod = await Resposta.count({
    distinct: true,
    col: "respondentSessionId",
    where: {
      ...periodWhere,
      ratingValue: { [Op.gte]: 9 },
      respondentSessionId: { [Op.ne]: null },
    },
  });

  const totalResponsesInPeriod = await Resposta.count({ where: periodWhere });
  const registrationsInPeriod = await Client.count({ where: periodWhere });
  const couponsGeneratedInPeriod = await Cupom.count({ where: periodWhere });

  const couponsUsedWhere = { ...baseWhere, status: "used" };
  if (Object.keys(periodDateFilter).length > 0) {
      couponsUsedWhere.updatedAt = periodDateFilter;
  }
  const couponsUsedInPeriod = await Cupom.count({ where: couponsUsedWhere });

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
      neutral: csatNeutrals,
      unsatisfied: csatUnsatisfied,
      total: csatCount,
    },
    registrations: registrationsInPeriod,
    registrationsConversion:
      totalResponsesInPeriod > 0
        ? parseFloat(((registrationsInPeriod / totalResponsesInPeriod) * 100).toFixed(2))
        : 0,
    ambassadorsMonth: uniquePromoterClientsInPeriod,
    couponsGenerated: couponsGeneratedInPeriod,
    couponsGeneratedPeriod:
      startDate && endDate
        ? `${formatInTimeZone(startDate, "dd/MM")} - ${formatInTimeZone(endDate, "dd/MM")}`
        : "N/A",
    couponsUsed: couponsUsedInPeriod,
    couponsUsedConversion:
      couponsGeneratedInPeriod > 0
        ? parseFloat(((couponsUsedInPeriod / couponsGeneratedInPeriod) * 100).toFixed(2))
        : 0,
    totalResponses: totalResponsesInPeriod,
    totalUsers: totalClients,
    totalTenants,
  };
};

const getClientStatusCounts = async (tenantId = null, startDate = null, endDate = null) => {
    const whereClause = { tenantId };
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    const responses = await Resposta.findAll({
        where: whereClause,
        attributes: [
          [fn("DISTINCT", col("respondentSessionId")), "sessionId"],
        ],
    });

    const sessionIds = responses.map(r => r.dataValues.sessionId).filter(id => id !== null);

    if (sessionIds.length === 0) {
      return { withClient: 0, withoutClient: 0 };
    }

    const withClient = await Client.count({
        where: {
            tenantId,
            respondentSessionId: { [Op.in]: sessionIds }
        }
    });

    return {
        withClient: withClient,
        withoutClient: sessionIds.length - withClient
    };
};

const getSurveysRespondedChart = async (tenantId = null, startDate = null, endDate = null, period = "day") => {
    const whereClause = tenantId ? { tenantId } : {};
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }
    whereClause.respondentSessionId = { [Op.ne]: null };

    const surveysByPeriod = await Resposta.findAll({
      where: whereClause,
      attributes: [
        [fn("date_trunc", period, col("createdAt")), "period"],
        [fn("COUNT", fn("DISTINCT", col("respondentSessionId"))), "count"],
      ],
      group: [fn("date_trunc", period, col("createdAt"))],
      order: [[fn("date_trunc", period, col("createdAt")), "ASC"]],
    });

    return surveysByPeriod.map((item) => ({
      name: formatInTimeZone(item.dataValues.period, period === "day" ? "dd/MM" : period === "week" ? "ww/yyyy" : "MM/yyyy"),
      "Pesquisas Respondidas": parseInt(item.dataValues.count),
    }));
};

const getResponseChart = async (tenantId = null, startDate = null, endDate = null, period = "day") => {
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
};

const getFeedbacks = async (tenantId = null, startDate = null, endDate = null) => {
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
    attributes: ["createdAt", "textValue", "ratingValue", "respondentSessionId"],
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

  return feedbacksData.map((feedback) => ({
    date: feedback.createdAt ? formatInTimeZone(feedback.createdAt, "dd/MM/yyyy HH:mm") : "Data indisponível",
    client: feedback.client ? feedback.client.name : "Anônimo",
    comment: feedback.textValue,
    nps: feedback.ratingValue !== null ? feedback.ratingValue : undefined,
  }));
};

const getNpsByCriteria = async (tenantId = null, startDate = null, endDate = null) => {
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
      [fn("SUM", literal(`CASE WHEN "perguntas->respostas"."ratingValue" >= 9 THEN 1 ELSE 0 END`)), "promoters"],
      [fn("SUM", literal(`CASE WHEN "perguntas->respostas"."ratingValue" <= 6 THEN 1 ELSE 0 END`)), "detractors"],
      [fn("COUNT", col("perguntas->respostas.id")), "total"],
    ],
    include: [{
      model: Pergunta,
      as: "perguntas",
      attributes: [],
      required: true,
      where: { type: "rating_0_10" },
      include: [{
        model: Resposta,
        as: "respostas",
        attributes: [],
        where: responseWhereClause,
        required: true,
      }],
    }],
    group: ["Criterio.id", "Criterio.name"],
  });

  return npsData.map((item) => {
    const promoters = parseInt(item.dataValues.promoters) || 0;
    const detractors = parseInt(item.dataValues.detractors) || 0;
    const total = parseInt(item.dataValues.total) || 0;
    const nps = total > 0 ? ((promoters - detractors) / total) * 100 : 0;
    return {
      name: item.name,
      nps: parseFloat(nps.toFixed(1)),
      promoters,
      detractors,
      neutrals: total - promoters - detractors,
      total,
    };
  });
};

const getNpsDistribution = async (tenantId = null, startDate = null, endDate = null) => {
  const whereClause = { ratingValue: { [Op.ne]: null } };
  if (tenantId) whereClause.tenantId = tenantId;
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = startDate;
  if (endDate) dateFilter[Op.lte] = endDate;
  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  const ratingResponses = await Resposta.findAll({
    where: whereClause,
    include: [{ model: Pergunta, as: "pergunta", attributes: ["type"], required: true }],
  });

  let promoters = 0, neutrals = 0, detractors = 0;
  ratingResponses.forEach(({ ratingValue, pergunta }) => {
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
};

const getNpsTrendData = async (tenantId = null, period = "day", startDate = null, endDate = null) => {
  const whereClause = { ratingValue: { [Op.ne]: null } };
  if (tenantId) whereClause.tenantId = tenantId;
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = startDate;
  if (endDate) dateFilter[Op.lte] = endDate;
  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  const trendData = await Resposta.findAll({
    where: whereClause,
    include: [{ model: Pergunta, as: 'pergunta', attributes: [], where: { type: 'rating_0_10' }, required: true }],
    attributes: [
      [fn("date_trunc", period, col("Resposta.createdAt")), "period"],
      [fn("SUM", literal(`CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END`)), "promoters"],
      [fn("SUM", literal(`CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END`)), "detractors"],
      [fn("COUNT", col("Resposta.id")), "total"],
    ],
    group: [fn("date_trunc", period, col("Resposta.createdAt"))],
    order: [[fn("date_trunc", period, col("Resposta.createdAt")), "ASC"]],
  });

  return trendData.map((item) => {
    const { period, promoters: p, detractors: d, total: t } = item.dataValues;
    const promoters = parseInt(p) || 0;
    const detractors = parseInt(d) || 0;
    const total = parseInt(t) || 0;
    const nps = total > 0 ? ((promoters - detractors) / total) * 100 : 0;
    return {
      period: formatInTimeZone(period, 'dd/MM'),
      nps: parseFloat(nps.toFixed(1)),
    };
  });
};

const getConversionChartData = async (tenantId = null, startDate = null, endDate = null) => {
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
  
  const usedWhereClause = { tenantId, status: 'used' };
  if (Object.keys(dateFilter).length > 0) {
    usedWhereClause.updatedAt = dateFilter;
  }
  const couponsUsed = await Cupom.count({ where: usedWhereClause });

  return [
    { name: 'Respostas', value: totalResponses },
    { name: 'Cadastros', value: totalRegistrations },
    { name: 'Cupons Gerados', value: couponsGenerated },
    { name: 'Cupons Utilizados', value: couponsUsed },
  ];
};

const getWordCloudData = async (tenantId = null, startDate = null, endDate = null) => {
  const whereClause = {
    textValue: { [Op.ne]: null, [Op.ne]: "" },
  };
  if (tenantId) whereClause.tenantId = tenantId;
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = startDate;
  if (endDate) dateFilter[Op.lte] = endDate;
  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  const responses = await Resposta.findAll({ where: whereClause, attributes: ["textValue"] });
  if (!responses.length) return [];

  const stopwords = new Set(["de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "com", "não", "uma", "os", "no", "na", "por", "mais", "as", "dos", "como", "mas", "foi", "ao", "ele", "das", "tem", "à", "seu", "sua", "ou", "ser", "quando", "muito", "há", "nos", "já", "está", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem", "nas", "me", "esse", "eles", "estão", "você", "tinha", "foram", "essa", "num", "nem", "suas", "meu", "às", "minha", "têm", "numa", "pelos", "elas", "havia", "seja", "qual", "será", "nós", "tenho", "lhe", "deles", "essas", "esses", "pelas", "este", "fosse", "dele", "tu", "te", "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", "nossa", "nossos", "nossas", "dela", "delas", "esta", "estes", "estas", "aquele", "aquela", "aqueles", "aquelas", "isto", "aquilo", "estou", "está", "estamos", "estão", "estive", "esteve", "estivemos", "estiveram", "estava", "estávamos", "estavam", "estivera", "estivéramos", "esteja", "estejamos", "estejam", "estivesse", "estivéssemos", "estivessem", "estiver", "estivermos", "estiverem", "hei", "há", "havemos", "hão", "houve", "houvemos", "houveram", "houvera", "houvéramos", "haja", "hajamos", "hajam", "houvesse", "houvéssemos", "houvessem", "houver", "houvermos", "houverem", "houverei", "houverá", "houveremos", "houverão", "houveria", "houveríamos", "houveriam", "sou", "somos", "são", "era", "éramos", "eram", "fui", "foi", "fomos", "foram", "fora", "fôramos", "seja", "sejamos", "sejam", "fosse", "fôssemos", "fossem", "for", "formos", "forem", "serei", "será", "seremos", "serão", "seria", "seríamos", "seriam", "bom", "ótimo", "excelente", "gostei", "muito", "atendimento", "comida"]);
  const wordCounts = {};
  responses.forEach(response => {
    const words = response.textValue.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    words.forEach(word => {
      if (word && !stopwords.has(word) && word.length > 2) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);
};

const getNpsByDayOfWeek = async (tenantId = null, startDate = null, endDate = null) => {
  const whereClause = { ratingValue: { [Op.ne]: null } };
  if (tenantId) whereClause.tenantId = tenantId;
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = startDate;
  if (endDate) dateFilter[Op.lte] = endDate;
  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  const npsData = await Resposta.findAll({
    where: whereClause,
    attributes: [
      [Sequelize.fn('EXTRACT', Sequelize.literal('DOW FROM "Resposta"."createdAt"')), 'dayOfWeek'],
      [fn("SUM", literal(`CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END`)), "promoters"],
      [fn("SUM", literal(`CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END`)), "detractors"],
      [fn("COUNT", col("id")), "total"],
    ],
    group: [Sequelize.fn('EXTRACT', Sequelize.literal('DOW FROM "Resposta"."createdAt"'))],
    order: [[Sequelize.fn('EXTRACT', Sequelize.literal('DOW FROM "Resposta"."createdAt"')), 'ASC']],
  });

  const daysOfWeekNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return npsData.map(item => {
    const { dayOfWeek, promoters: p, detractors: d, total: t } = item.dataValues;
    const promoters = parseInt(p) || 0;
    const detractors = parseInt(d) || 0;
    const total = parseInt(t) || 0;
    const nps = total > 0 ? ((promoters - detractors) / total) * 100 : 0;
    return {
      dayOfWeek: daysOfWeekNames[dayOfWeek],
      nps: parseFloat(nps.toFixed(1)),
    };
  });
};

const getAttendantsPerformance = async (tenantId, startDate, endDate) => {
  const whereClause = { tenantId };
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = startDate;
  if (endDate) dateFilter[Op.lte] = endDate;
  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  const attendants = await Atendente.findAll({
    where: { tenantId, status: 'active' },
    include: [{ model: AtendenteMeta, as: 'meta' }]
  });
  const attendantIds = attendants.map(a => a.id);

  const allResponses = await Resposta.findAll({
    where: { ...whereClause, atendenteId: { [Op.in]: attendantIds } },
    include: [{ model: Pergunta, as: 'pergunta', attributes: ['type'] }]
  });

  const responsesByAttendant = allResponses.reduce((acc, response) => {
    if (!acc[response.atendenteId]) acc[response.atendenteId] = [];
    acc[response.atendenteId].push(response);
    return acc;
  }, {});

  return attendants.map(attendant => {
    const responses = responsesByAttendant[attendant.id] || [];
    const ratingResponses = responses.filter(r => r.ratingValue !== null && r.pergunta.type === 'rating_0_10');
    const promoters = ratingResponses.filter(r => r.ratingValue >= 9).length;
    const detractors = ratingResponses.filter(r => r.ratingValue <= 6).length;
    const npsTotal = ratingResponses.length;
    const nps = npsTotal > 0 ? ((promoters - detractors) / npsTotal) * 100 : 0;
    const csatResponses = responses.filter(r => r.ratingValue !== null && (r.pergunta.type === 'rating_1_5' || r.pergunta.type === 'rating'));
    const csatTotalScore = csatResponses.reduce((sum, r) => sum + r.ratingValue, 0);
    const csatAverage = csatResponses.length > 0 ? csatTotalScore / csatResponses.length : 0;

    return {
      id: attendant.id,
      name: attendant.name,
      responses: responses.length,
      currentNPS: parseFloat(nps.toFixed(1)),
      currentCSAT: parseFloat(csatAverage.toFixed(1)),
      npsGoal: attendant.meta?.npsGoal ? parseFloat(attendant.meta.npsGoal) : 0,
      csatGoal: 0,
    };
  });
};

const getAttendantDetails = async (tenantId, attendantId, startDate, endDate) => {
    const whereClause = { tenantId, atendenteId: attendantId };
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    const attendant = await Atendente.findByPk(attendantId, {
      include: [{ model: AtendenteMeta, as: 'meta' }]
    });

    if (!attendant) throw new Error('Atendente não encontrado.');

    const responses = await Resposta.findAll({
      where: whereClause,
      include: [{ model: Pergunta, as: 'pergunta', attributes: ['type'] }]
    });

    let npsPromoters = 0, npsNeutrals = 0, npsDetractors = 0;
    let csatTotalScore = 0, csatCount = 0;

    responses.forEach(response => {
      const { ratingValue, pergunta } = response;
      if (!pergunta || ratingValue === null) return;
      if (pergunta.type === 'rating_0_10') {
        if (ratingValue >= 9) npsPromoters++;
        else if (ratingValue >= 7) npsNeutrals++;
        else npsDetractors++;
      } else if (pergunta.type === 'rating_1_5' || pergunta.type === 'rating') {
        csatTotalScore += ratingValue;
        csatCount++;
      }
    });

    const totalNpsResponses = npsPromoters + npsNeutrals + npsDetractors;
    const npsScore = totalNpsResponses > 0 ? ((npsPromoters - npsDetractors) / totalNpsResponses) * 100 : 0;
    const csatAverageScore = csatCount > 0 ? csatTotalScore / csatCount : 0;

    const recentFeedbacks = await Resposta.findAll({
        where: { ...whereClause, textValue: { [Op.ne]: null, [Op.ne]: "" } },
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [{ model: Client, as: 'client', attributes: ['name'] }]
    });

    return {
      attendant: {
        id: attendant.id,
        name: attendant.name,
        npsGoal: attendant.meta?.npsGoal,
        csatGoal: 0,
        responsesGoal: attendant.meta?.responsesGoal,
      },
      performance: {
        nps: parseFloat(npsScore.toFixed(1)),
        csat: parseFloat(csatAverageScore.toFixed(1)),
        totalResponses: responses.length,
      },
      recentFeedbacks: recentFeedbacks.map(fb => ({
        date: formatInTimeZone(fb.createdAt, 'dd/MM/yyyy HH:mm'),
        client: fb.client?.name || 'Anônimo',
        rating: fb.ratingValue,
        comment: fb.textValue,
        respondentSessionId: fb.respondentSessionId
      }))
    };
};

const getResponseDetails = async (tenantId, sessionId) => {
    const responses = await Resposta.findAll({
      where: { tenantId, respondentSessionId: sessionId },
      include: [{ model: Pergunta, as: 'pergunta', attributes: ['text', 'type', 'options'] }],
      order: [['createdAt', 'ASC']]
    });

    if (!responses || responses.length === 0) return [];

    return responses.map(r => {
      let answer = r.textValue || r.selectedOption;
      if (r.ratingValue !== null) answer = r.ratingValue.toString();
      return {
        'Pergunta': r.pergunta.text,
        'Resposta': answer,
        'Data': formatInTimeZone(r.createdAt, 'dd/MM/yyyy HH:mm')
      };
    });
};

const getDemographicsData = async (tenantId, startDate, endDate) => {
  const whereClause = { tenantId };
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = startDate;
  if (endDate) dateFilter[Op.lte] = endDate;
  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  const clients = await Client.findAll({ where: whereClause, attributes: ['gender', 'birthDate'] });
  const genderDistribution = { 'Masculino': 0, 'Feminino': 0, 'Outro': 0, 'Não informado': 0 };
  const ageDistribution = { '0-17': 0, '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0, 'N/A': 0 };

  clients.forEach(client => {
    if (client.gender) {
      const gender = client.gender.toLowerCase();
      if (gender === 'masculino' || gender === 'm') genderDistribution['Masculino']++;
      else if (gender === 'feminino' || gender === 'f') genderDistribution['Feminino']++;
      else genderDistribution['Outro']++;
    } else {
      genderDistribution['Não informado']++;
    }

    if (client.birthDate) {
      const age = new Date().getFullYear() - new Date(client.birthDate).getFullYear();
      if (age <= 17) ageDistribution['0-17']++;
      else if (age <= 24) ageDistribution['18-24']++;
      else if (age <= 34) ageDistribution['25-34']++;
      else if (age <= 44) ageDistribution['35-44']++;
      else if (age <= 54) ageDistribution['45-54']++;
      else ageDistribution['55+']++;
    } else {
      ageDistribution['N/A']++;
    }
  });

  return { genderDistribution, ageDistribution };
};

const getMonthSummary = async (tenantId, startDate, endDate) => {
  const whereClause = { tenantId: tenantId || { [Op.ne]: null } };
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = startDate;
  if (endDate) dateFilter[Op.lte] = endDate;
  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  const responses = await Resposta.findAll({
    where: whereClause,
    attributes: ['id', 'createdAt', 'respondentSessionId', 'ratingValue'],
    include: [{ model: Pergunta, as: 'pergunta', attributes: ['type']}],
    order: [['createdAt', 'ASC']],
  });

  const totalResponses = responses.length;
  const npsByDate = {};
  responses.forEach(r => {
    if (r.pergunta?.type !== 'rating_0_10') return;
    const date = formatInTimeZone(r.createdAt, 'yyyy-MM-dd');
    if (!npsByDate[date]) npsByDate[date] = { promoters: 0, detractors: 0, total: 0 };
    if (r.ratingValue >= 9) npsByDate[date].promoters++;
    if (r.ratingValue <= 6) npsByDate[date].detractors++;
    npsByDate[date].total++;
  });

  let accumulatedPromoters = 0, accumulatedDetractors = 0, accumulatedTotal = 0;
  const dailyNps = Object.keys(npsByDate).map(date => {
    const day = npsByDate[date];
    accumulatedPromoters += day.promoters;
    accumulatedDetractors += day.detractors;
    accumulatedTotal += day.total;
    const dailyNpsScore = day.total > 0 ? ((day.promoters - day.detractors) / day.total) * 100 : 0;
    const accumulatedNpsScore = accumulatedTotal > 0 ? ((accumulatedPromoters - accumulatedDetractors) / accumulatedTotal) * 100 : 0;
    return {
      date: formatInTimeZone(new Date(date), 'dd/MM'),
      nps: parseFloat(dailyNpsScore.toFixed(1)),
      accumulatedNps: parseFloat(accumulatedNpsScore.toFixed(1)),
    };
  });

  const peakHours = Array(24).fill(0).reduce((acc, _, i) => ({ ...acc, [i.toString().padStart(2, '0')]: 0 }), {});
  responses.forEach(r => {
    const hour = formatInTimeZone(r.createdAt, 'HH');
    if (peakHours[hour] !== undefined) peakHours[hour]++;
  });
  const peakHoursData = Object.keys(peakHours).map(hour => ({ hour, count: peakHours[hour] }));
  
  const daysOfWeekNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weekdayDistribution = Array(7).fill(0).map((_, i) => ({ day: daysOfWeekNames[i], count: 0 }));
  responses.forEach(r => weekdayDistribution[new Date(r.createdAt).getDay()].count++);

  const respondentSessionIds = [...new Set(responses.map(r => r.respondentSessionId))];
  const registeredClients = await Client.count({
    where: { tenantId, respondentSessionId: { [Op.in]: respondentSessionIds } }
  });
  const clientProportion = {
    registered: registeredClients,
    unregistered: respondentSessionIds.length - registeredClients,
  };

  return { totalResponses, dailyNps, peakHours: peakHoursData, weekdayDistribution, clientProportion };
};

const getDetails = async (tenantId, startDate, endDate, category) => {
    const where = { tenantId: tenantId || { [Op.ne]: null } };
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    const includeClient = { model: Client, as: 'client', attributes: ['name', 'phone'], required: false };
    const formatResponse = r => ({
        id: r.id,
        Data: formatInTimeZone(r.createdAt, 'dd/MM/yyyy HH:mm'),
        Cliente: r.client?.name || 'Anônimo',
        Telefone: r.client?.phone,
        Nota: r.ratingValue,
        Comentário: r.textValue,
    });

    switch (category) {
      case 'total-respostas': {
        const responses = await Resposta.findAll({ where, include: [includeClient], order: [['createdAt', 'DESC']] });
        return responses.map(formatResponse);
      }
      case 'nps-geral':
      case 'promotores':
      case 'neutros':
      case 'detratores': {
        const npsWhere = { ...where, ratingValue: { [Op.ne]: null } };
        if (category === 'promotores') npsWhere.ratingValue = { [Op.gte]: 9 };
        if (category === 'neutros') npsWhere.ratingValue = { [Op.between]: [7, 8] };
        if (category === 'detratores') npsWhere.ratingValue = { [Op.lte]: 6 };
        
        const responses = await Resposta.findAll({
          where: npsWhere,
          include: [includeClient, { model: Pergunta, as: 'pergunta', where: { type: 'rating_0_10' }, attributes: [], required: true }],
          order: [['createdAt', 'DESC']]
        });
        return responses.map(formatResponse);
      }
      case 'csat-geral':
      case 'satisfeitos':
      case 'insatisfeitos': {
        const csatWhere = { ...where, ratingValue: { [Op.ne]: null } };
        if (category === 'satisfeitos') csatWhere.ratingValue = { [Op.gte]: 4 };
        if (category === 'insatisfeitos') csatWhere.ratingValue = { [Op.lte]: 3 };

        const responses = await Resposta.findAll({
          where: csatWhere,
          include: [includeClient, { model: Pergunta, as: 'pergunta', where: { type: { [Op.in]: ['rating_1_5', 'rating'] } }, attributes: [], required: true }],
          order: [['createdAt', 'DESC']]
        });
        return responses.map(formatResponse);
      }
      case 'cadastros': {
        const clients = await Client.findAll({ where, order: [['createdAt', 'DESC']] });
        return clients.map(c => ({ id: c.id, Data: formatInTimeZone(c.createdAt, 'dd/MM/yyyy HH:mm'), Nome: c.name, Telefone: c.phone, Email: c.email, Aniversário: c.birthday ? formatInTimeZone(c.birthday, 'dd/MM/yyyy') : null }));
      }
      case 'aniversariantes': {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const birthdayWhere = { tenantId: tenantId || { [Op.ne]: null }, [Op.and]: [Sequelize.literal(`EXTRACT(MONTH FROM "birthday") = ${currentMonth}`)] };
        const clients = await Client.findAll({ where: birthdayWhere, order: [['name', 'ASC']] });
        return clients.map(c => ({ id: c.id, Nome: c.name, Telefone: c.phone, Aniversário: c.birthday ? formatInTimeZone(c.birthday, 'dd/MM') : null }));
      }
      case 'cupons-gerados': {
        const coupons = await Cupom.findAll({ where, include: [{ model: Client, as: 'client', attributes: ['name']}], order: [['createdAt', 'DESC']] });
        return coupons.map(c => ({ id: c.id, 'Data de Geração': formatInTimeZone(c.createdAt, 'dd/MM/yyyy HH:mm'), 'Cliente': c.client?.name || 'N/A', 'Código': c.code, 'Status': c.status, 'Validade': c.dataValidade ? formatInTimeZone(c.dataValidade, 'dd/MM/yyyy') : 'N/A' }));
      }
      case 'cupons-utilizados': {
        const usedWhere = { tenantId: tenantId || { [Op.ne]: null }, status: 'used' };
        if (Object.keys(dateFilter).length > 0) usedWhere.updatedAt = dateFilter;
        const coupons = await Cupom.findAll({ where: usedWhere, include: [{ model: Client, as: 'client', attributes: ['name']}], order: [['updatedAt', 'DESC']] });
        return coupons.map(c => ({ id: c.id, 'Data de Utilização': formatInTimeZone(c.updatedAt, 'dd/MM/yyyy HH:mm'), 'Cliente': c.client?.name || 'N/A', 'Código': c.code, 'Status': c.status }));
      }
      default:
        return [];
    }
};

const getMainDashboard = async (tenantId = null, startDate = null, endDate = null, period = "day") => {
  const [
    summary,
    responseChart,
    npsTrend,
    npsDistribution,
    npsByCriteria,
    feedbacks,
    attendantsPerformance,
    wordCloudData,
    conversionChart,
    npsByDayOfWeek,
    surveysRespondedChart,
    demographics,
    clientStatusCounts,
  ] = await Promise.all([
    getSummary(tenantId, startDate, endDate),
    getResponseChart(tenantId, startDate, endDate, period),
    getNpsTrendData(tenantId, period, startDate, endDate),
    getNpsDistribution(tenantId, startDate, endDate),
    getNpsByCriteria(tenantId, startDate, endDate),
    getFeedbacks(tenantId, startDate, endDate),
    getAttendantsPerformance(tenantId, startDate, endDate),
    getWordCloudData(tenantId, startDate, endDate),
    getConversionChartData(tenantId, startDate, endDate),
    getNpsByDayOfWeek(tenantId, startDate, endDate),
    getSurveysRespondedChart(tenantId, startDate, endDate, period),
    getDemographicsData(tenantId, startDate, endDate),
    getClientStatusCounts(tenantId, startDate, endDate),
  ]);

  return {
    summary,
    responseChart,
    npsTrend,
    npsDistribution,
    feedbacks,
    attendantsPerformance,
    wordCloudData,
    conversionChart,
    npsByDayOfWeek,
    surveysRespondedChart,
    clientStatusCounts,
    criteriaScores: npsByCriteria.map(item => ({
      criterion: item.name,
      npsScore: item.nps,
      scoreType: 'NPS',
      promoters: item.promoters,
      neutrals: item.neutrals,
      detractors: item.detractors,
      total: item.total,
    })),
    overallResults: {
      scoresByCriteria: npsByCriteria.map(item => ({
        criterion: item.name,
        npsScore: item.nps,
        scoreType: 'NPS',
        promoters: item.promoters,
        neutrals: item.neutrals,
        detractors: item.detractors,
        total: item.total,
      })),
      overallNPS: summary.nps,
      overallCSAT: summary.csat,
    },
    demographics,
  };
};

const dashboardRepository = {
  getSummary,
  getSurveysRespondedChart,
  getResponseChart,
  getFeedbacks,
  getNpsByCriteria,
  getNpsDistribution,
  getNpsTrendData,
  getConversionChartData,
  getWordCloudData,
  getNpsByDayOfWeek,
  getAttendantsPerformance,
  getAttendantDetails,
  getResponseDetails,
  getDemographicsData,
  getMonthSummary,
  getDetails,
  getClientStatusCounts,
  getMainDashboard,
};

module.exports = dashboardRepository;