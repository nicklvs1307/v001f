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

const getSummary = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
  // --- FILTROS ---
  const whereClause = {};
  if (tenantId) whereClause.tenantId = tenantId;

  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
  }
  
  // Condição para a tabela Resposta, que pode ter pesquisaId
  const responseWhereClause = { ...whereClause };
  if (surveyId) {
    responseWhereClause.pesquisaId = surveyId;
  }

  // --- CÁLCULOS NPS (Período Selecionado) ---
  const ratingResponses = await Resposta.findAll({
    where: {
      ...responseWhereClause,
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
      ...responseWhereClause,
      ratingValue: { [Op.gte]: 9 },
      respondentSessionId: { [Op.ne]: null },
    },
  });

  // A contagem de cadastros depende se um surveyId foi passado
  let registrationsInPeriod;
  if (surveyId) {
    // Conta clientes distintos que responderam a ESTA pesquisa
    registrationsInPeriod = await Client.count({
      distinct: true,
      col: 'id',
      include: [{
        model: Resposta,
        as: 'respostas',
        required: true,
        where: { pesquisaId: surveyId }
      }],
      where: whereClause
    });
  } else {
    // Conta todos os novos clientes no período
    registrationsInPeriod = await Client.count({ where: whereClause });
  }

  const totalResponsesInPeriod = await Resposta.count({ where: responseWhereClause });
  const couponsGeneratedInPeriod = await Cupom.count({ where: whereClause });

  // Lógica separada para cupons usados, filtrando por updatedAt
  const couponsUsedWhere = { status: "used" };
  if (tenantId) couponsUsedWhere.tenantId = tenantId;
  if (startDate && endDate) {
    couponsUsedWhere.updatedAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    couponsUsedWhere.updatedAt = { [Op.gte]: startDate };
  } else if (endDate) {
    couponsUsedWhere.updatedAt = { [Op.lte]: endDate };
  }
  const couponsUsedInPeriod = await Cupom.count({ where: couponsUsedWhere });

  const totalClientsWhere = {};
  if (tenantId) totalClientsWhere.tenantId = tenantId;
  const totalClients = await Client.count({ where: totalClientsWhere });
  const totalTenants = tenantId ? 1 : await Tenant.count();


  return {
    nps: {
      npsScore: parseFloat(npsScore.toFixed(1)),
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
    if (startDate && endDate) {
      whereClause.createdAt = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      whereClause.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      whereClause.createdAt = { [Op.lte]: endDate };
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
    if (startDate && endDate) {
      whereClause.createdAt = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      whereClause.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      whereClause.createdAt = { [Op.lte]: endDate };
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
    if (startDate && endDate) {
      whereClause.createdAt = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      whereClause.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      whereClause.createdAt = { [Op.lte]: endDate };
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
  
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
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
    date: feedback.createdAt,
    client: feedback.client ? feedback.client.name : "Anônimo",
    comment: feedback.textValue,
    nps: feedback.ratingValue !== null ? feedback.ratingValue : undefined,
    respondentSessionId: feedback.respondentSessionId
  }));
};

const getNpsByCriteria = async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
  const whereClause = { tenantId: tenantId || { [Op.ne]: null } };

  const responseWhere = { ratingValue: { [Op.ne]: null } };
  if (startDate && endDate) {
    responseWhere.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    responseWhere.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    responseWhere.createdAt = { [Op.lte]: endDate };
  }

  if (surveyId) {
    responseWhere.pesquisaId = surveyId;
  }

  const criterios = await Criterio.findAll({
    where: whereClause,
    include: [{
      model: Pergunta,
      as: 'perguntas',
      attributes: ['id', 'type'],
      include: [{
        model: Resposta,
        as: 'respostas',
        where: responseWhere,
        required: false, // Left join to get all questions
        attributes: ['ratingValue']
      }]
    }],
    order: [['name', 'ASC']]
  });

  return criterios.map(criterio => {
    const result = {
      criterion: criterio.name,
      scoreType: null,
      promoters: 0,
      neutrals: 0,
      detractors: 0,
      satisfied: 0,
      neutral: 0,
      unsatisfied: 0,
      total: 0,
      npsScore: 0,
      satisfactionRate: 0,
    };

    if (!criterio.perguntas || criterio.perguntas.length === 0) {
      return result;
    }

    // Assuming one rating question per criterion
    const pergunta = criterio.perguntas[0];
    if (!pergunta) return result;

    result.scoreType = pergunta.type === 'rating_0_10' ? 'NPS' : 'CSAT';
    
    if (!pergunta.respostas || pergunta.respostas.length === 0) {
      return result;
    }

    pergunta.respostas.forEach(resposta => {
      const value = resposta.ratingValue;
      if (value === null) return;

      result.total++;
      if (pergunta.type === 'rating_0_10') {
        if (value >= 9) result.promoters++;
        else if (value >= 7) result.neutrals++;
        else result.detractors++;
      } else if (pergunta.type === 'rating_1_5' || pergunta.type === 'rating') {
        if (value >= 4) result.satisfied++;
        else if (value === 3) result.neutral++;
        else result.unsatisfied++;
      }
    });

    if (result.total > 0) {
      if (result.scoreType === 'NPS') {
        result.npsScore = parseFloat((((result.promoters - result.detractors) / result.total) * 100).toFixed(1));
      } else {
        result.satisfactionRate = parseFloat(((result.satisfied / result.total) * 100).toFixed(1));
      }
    }

    return result;
  });
};

const getNpsDistribution = async (tenantId = null, startDate = null, endDate = null) => {
  const whereClause = { ratingValue: { [Op.ne]: null } };
  if (tenantId) whereClause.tenantId = tenantId;
  
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
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

  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
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

const getEvolutionData = async (tenantId = null, period = "day", startDate = null, endDate = null) => {
  const whereClause = { tenantId: tenantId || { [Op.ne]: null } };
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
  }

  const responseTrends = await Resposta.findAll({
    where: whereClause,
    attributes: [
      [fn("date_trunc", period, col("Resposta.createdAt")), "period"],
      [fn("SUM", literal(`CASE WHEN "pergunta"."type" = 'rating_0_10' AND "ratingValue" >= 9 THEN 1 ELSE 0 END`)), "promoters"],
      [fn("SUM", literal(`CASE WHEN "pergunta"."type" = 'rating_0_10' AND "ratingValue" <= 6 THEN 1 ELSE 0 END`)), "detractors"],
      [fn("SUM", literal(`CASE WHEN "pergunta"."type" = 'rating_0_10' THEN 1 ELSE 0 END`)), "nps_total"],
      [fn("SUM", literal(`CASE WHEN "pergunta"."type" IN ('rating_1_5', 'rating') AND "ratingValue" >= 4 THEN 1 ELSE 0 END`)), "satisfied"],
      [fn("SUM", literal(`CASE WHEN "pergunta"."type" IN ('rating_1_5', 'rating') THEN 1 ELSE 0 END`)), "csat_total"],
      [fn("COUNT", col("Resposta.id")), "responses"],
    ],
    include: [{ model: Pergunta, as: "pergunta", attributes: [] }],
    group: [fn("date_trunc", period, col("Resposta.createdAt"))],
    order: [[fn("date_trunc", period, col("Resposta.createdAt")), "ASC"]],
    raw: true,
  });

  const registrationTrends = await Client.findAll({
    where: whereClause,
    attributes: [
      [fn("date_trunc", period, col("createdAt")), "period"],
      [fn("COUNT", col("id")), "registrations"],
    ],
    group: [fn("date_trunc", period, col("createdAt"))],
    order: [[fn("date_trunc", period, col("createdAt")), "ASC"]],
    raw: true,
  });

  const mergedData = {};

  const processItems = (items, key, valueCallback) => {
    items.forEach(item => {
      const periodKey = new Date(item.period).toISOString();
      if (!mergedData[periodKey]) {
        mergedData[periodKey] = {
          period: formatInTimeZone(item.period, 'dd/MM/yyyy'),
          nps: 0,
          satisfaction: 0,
          responses: 0,
          registrations: 0,
        };
      }
      mergedData[periodKey][key] = valueCallback(item);
    });
  };

  processItems(responseTrends, 'nps', item => {
    const promoters = parseInt(item.promoters) || 0;
    const detractors = parseInt(item.detractors) || 0;
    const total = parseInt(item.nps_total) || 0;
    return total > 0 ? parseFloat((((promoters - detractors) / total) * 100).toFixed(1)) : 0;
  });

  processItems(responseTrends, 'satisfaction', item => {
    const satisfied = parseInt(item.satisfied) || 0;
    const total = parseInt(item.csat_total) || 0;
    return total > 0 ? parseFloat(((satisfied / total) * 100).toFixed(1)) : 0;
  });

  processItems(responseTrends, 'responses', item => parseInt(item.responses) || 0);
  processItems(registrationTrends, 'registrations', item => parseInt(item.registrations) || 0);

  return Object.values(mergedData).sort((a, b) => new Date(a.period.split('/').reverse().join('-')) - new Date(b.period.split('/').reverse().join('-')));
};

const getConversionChartData = async (tenantId = null, startDate = null, endDate = null) => {
  const whereClause = {};
  if (tenantId) whereClause.tenantId = tenantId;
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
  }

  const totalResponses = await Resposta.count({ where: whereClause });
  const totalRegistrations = await Client.count({ where: whereClause });
  const couponsGenerated = await Cupom.count({ where: whereClause });
  
  const usedWhereClause = { tenantId, status: 'used' };
  if (startDate && endDate) {
    usedWhereClause.updatedAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    usedWhereClause.updatedAt = { [Op.gte]: startDate };
  } else if (endDate) {
    usedWhereClause.updatedAt = { [Op.lte]: endDate };
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
  
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
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
  
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
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
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
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
    if (startDate && endDate) {
      whereClause.createdAt = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      whereClause.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      whereClause.createdAt = { [Op.lte]: endDate };
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

const getMonthSummaryData = async (tenantId, startDate, endDate) => {
  const whereClause = { tenantId: tenantId || { [Op.ne]: null } };
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  }

  const responses = await Resposta.findAll({
    where: whereClause,
    attributes: ['id', 'createdAt', 'respondentSessionId', 'ratingValue'],
    include: [{ model: Pergunta, as: 'pergunta', attributes: ['type'] }],
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
  const dailyNps = Object.keys(npsByDate).sort().map(date => {
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
  responses.forEach(r => weekdayDistribution[new Date(r.createdAt).getUTCDay()].count++);

  const respondentSessionIds = [...new Set(responses.map(r => r.respondentSessionId).filter(id => id))];
  const registeredClients = respondentSessionIds.length > 0 ? await Client.count({
    where: { tenantId, respondentSessionId: { [Op.in]: respondentSessionIds } }
  }) : 0;
  const clientProportion = {
    registered: registeredClients,
    unregistered: respondentSessionIds.length - registeredClients,
  };

  return { totalResponses, dailyNps, peakHours: peakHoursData, weekdayDistribution, clientProportion };
};

const getDashboardData = async (tenantId = null, startDate = null, endDate = null, period = "day", surveyId = null) => {
  const [
    summary,
    responseChart,
    npsTrend,
    npsDistribution,
    scoresByCriteriaData,
    feedbacks,
    attendantsPerformance,
    wordCloudData,
    conversionChart,
    npsByDayOfWeek,
    surveysRespondedChart,
    demographics,
    clientStatusCounts,
    monthSummary,
  ] = await Promise.all([
    getSummary(tenantId, startDate, endDate, surveyId),
    getResponseChart(tenantId, startDate, endDate, period),
    getNpsTrendData(tenantId, period, startDate, endDate),
    getNpsDistribution(tenantId, startDate, endDate),
    getNpsByCriteria(tenantId, startDate, endDate, surveyId),
    getFeedbacks(tenantId, startDate, endDate),
    getAttendantsPerformance(tenantId, startDate, endDate),
    getWordCloudData(tenantId, startDate, endDate),
    getConversionChartData(tenantId, startDate, endDate),
    getNpsByDayOfWeek(tenantId, startDate, endDate),
    getSurveysRespondedChart(tenantId, startDate, endDate, period),
    getDemographicsData(tenantId, startDate, endDate),
    getClientStatusCounts(tenantId, startDate, endDate),
    getMonthSummaryData(tenantId, startDate, endDate),
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
    criteriaScores: scoresByCriteriaData,
    overallResults: {
      scoresByCriteria: scoresByCriteriaData,
      overallNPS: summary.nps,
      overallCSAT: summary.csat,
    },
    demographics,
    monthSummary,
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
  getEvolutionData,
  getConversionChartData,
  getWordCloudData,
  getNpsByDayOfWeek,
  getAttendantsPerformance,
  getAttendantDetails,
  getResponseDetails,
  getDemographicsData,
  getDetails,
  getClientStatusCounts,
  getDashboardData,
};

module.exports = dashboardRepository;