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
const { now, formatInTimeZone, TIMEZONE } = require("../utils/dateUtils");
const { startOfMonth } = require("date-fns");
const ratingService = require("../services/ratingService");

const { fn, col, literal } = Sequelize;

const getSummary = async (
  tenantId = null,
  startDate = null,
  endDate = null,
  surveyId = null,
) => {
  const whereClause = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }

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

  const ratingResponses = await Resposta.findAll({
    where: {
      ...responseWhereClause,
      ratingValue: { [Op.ne]: null },
    },
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: ["type", "criterioId"], // Inclui o criterioId para filtragem
        required: true,
      },
    ],
  });

  const npsResponses = ratingResponses.filter(
    (r) => r.pergunta.type === "rating_0_10",
  );
  const npsResult = ratingService.calculateNPS(npsResponses);

  let csatSatisfied = 0,
    csatNeutrals = 0,
    csatUnsatisfied = 0,
    csatTotalScore = 0,
    csatCount = 0;

  ratingResponses.forEach((response) => {
    const { ratingValue, pergunta } = response;
    if (!pergunta) return;

    // Lógica de CSAT (permanece inalterada)
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
      col: "id",
      include: [
        {
          model: Resposta,
          as: "respostas",
          required: true,
          where: { pesquisaId: surveyId },
        },
      ],
      where: whereClause,
    });
  } else {
    // Conta todos os novos clientes no período
    registrationsInPeriod = await Client.count({ where: whereClause });
  }

  const totalSurveysResponded = await Resposta.count({ 
    distinct: true, 
    col: "respondentSessionId", 
    where: { ...responseWhereClause, respondentSessionId: { [Op.ne]: null } } 
  });
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
      npsScore: npsResult.npsScore,
      promoters: npsResult.promoters,
      neutrals: npsResult.neutrals,
      detractors: npsResult.detractors,
      total: npsResult.total,
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
    totalSurveysResponded > 0
        ? parseFloat(
            ((registrationsInPeriod / totalSurveysResponded) * 100).toFixed(2),
          )
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
        ? parseFloat(
            ((couponsUsedInPeriod / couponsGeneratedInPeriod) * 100).toFixed(2),
          )
        : 0,
    totalResponses: totalSurveysResponded, // Alterado para refletir pesquisas únicas
    totalSurveysResponded,
    totalUsers: totalClients,
    totalTenants,
  };
};

const getClientStatusCounts = async (
  tenantId = null,
  startDate = null,
  endDate = null,
) => {
  const whereClause = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
  }

  const responses = await Resposta.findAll({
    where: whereClause,
    attributes: [[fn("DISTINCT", col("respondentSessionId")), "sessionId"]],
  });

  const sessionIds = responses
    .map((r) => r.dataValues.sessionId)
    .filter((id) => id !== null);

  if (sessionIds.length === 0) {
    return { withClient: 0, withoutClient: 0 };
  }

  const withClient = await Client.count({
    where: {
      tenantId,
      respondentSessionId: { [Op.in]: sessionIds },
    },
  });

  return {
    withClient: withClient,
    withoutClient: sessionIds.length - withClient,
  };
};

const getSurveysRespondedChart = async (
  tenantId = null,
  startDate = null,
  endDate = null,
  period = "day",
) => {
  const whereClause = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }
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
      [fn("date_trunc", period, literal(`"createdAt" AT TIME ZONE '${TIMEZONE}'`)), "period"],
      [fn("COUNT", fn("DISTINCT", col("respondentSessionId"))), "count"],
    ],
    group: [fn("date_trunc", period, literal(`"createdAt" AT TIME ZONE '${TIMEZONE}'`))],
    order: [[fn("date_trunc", period, literal(`"createdAt" AT TIME ZONE '${TIMEZONE}'`)), "ASC"]],
  });

  return surveysByPeriod.map((item) => ({
    name: formatInTimeZone(
      item.dataValues.period,
      period === "day" ? "dd/MM" : period === "week" ? "ww/yyyy" : "MM/yyyy",
    ),
    "Pesquisas Respondidas": parseInt(item.dataValues.count),
  }));
};

const getResponseChart = async (
  tenantId = null,
  startDate = null,
  endDate = null,
  period = "day",
) => {
  const whereClause = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }
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
      [fn("date_trunc", period, literal(`"createdAt" AT TIME ZONE '${TIMEZONE}'`)), "period"],
      [fn("COUNT", col("id")), "count"],
    ],
    group: [fn("date_trunc", period, literal(`"createdAt" AT TIME ZONE '${TIMEZONE}'`))],
    order: [[fn("date_trunc", period, literal(`"createdAt" AT TIME ZONE '${TIMEZONE}'`)), "ASC"]],
  });

  return responsesByPeriod.map((item) => ({
    name: formatInTimeZone(
      item.dataValues.period,
      period === "day" ? "dd/MM" : period === "week" ? "ww/yyyy" : "MM/yyyy",
    ),
    Respostas: parseInt(item.dataValues.count),
  }));
};

const getFeedbacks = async (
  tenantId = null,
  startDate = null,
  endDate = null,
  npsClassification = 'all',
  page = 1,
  limit = 10,
) => {
  const sessionFilterWhereClause = {
    [Op.or]: [
      { ratingValue: { [Op.ne]: null } },
      { textValue: { [Op.ne]: null, [Op.ne]: "" } }
    ]
  };

  if (tenantId) {
    if (Array.isArray(tenantId)) {
      sessionFilterWhereClause.tenantId = { [Op.in]: tenantId };
    } else {
      sessionFilterWhereClause.tenantId = tenantId;
    }
  }
  if (startDate && endDate) sessionFilterWhereClause.createdAt = { [Op.between]: [startDate, endDate] };

  // Etapa de Pré-filtragem para classificação NPS
  if (npsClassification && npsClassification !== 'all') {
    const npsQuestionType = 'rating_0_10';
    let ratingWhere;

    if (npsClassification === 'promoters') {
      ratingWhere = { [Op.gte]: 9 };
    } else if (npsClassification === 'neutrals') {
      ratingWhere = { [Op.between]: [7, 8] };
    } else if (npsClassification === 'detractors') {
      ratingWhere = { [Op.lte]: 6 };
    }

    if (ratingWhere) {
      const classifiedSessionIds = await Resposta.findAll({
        where: {
          tenantId: sessionFilterWhereClause.tenantId,
          createdAt: sessionFilterWhereClause.createdAt,
          ratingValue: ratingWhere
        },
        include: [{
          model: Pergunta,
          as: 'pergunta',
          where: { type: npsQuestionType },
          attributes: []
        }],
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('respondentSessionId')), 'respondentSessionId']],
        raw: true,
      }).then(sessions => sessions.map(s => s.respondentSessionId));
      
      // Adiciona o filtro de IDs de sessão à cláusula principal
      sessionFilterWhereClause.respondentSessionId = { [Op.in]: classifiedSessionIds };
    }
  }

  // 1. Encontrar IDs de sessões únicas no período com feedbacks relevantes (e já filtradas se aplicável)
  const distinctSessionIdsResult = await Resposta.findAll({
    where: sessionFilterWhereClause,
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('respondentSessionId')), 'respondentSessionId'],
      [Sequelize.fn('MIN', Sequelize.col('createdAt')), 'firstResponseAt']
    ],
    group: ['respondentSessionId'],
    order: [['firstResponseAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
    raw: true,
  });

  const sessionIds = distinctSessionIdsResult.map(s => s.respondentSessionId);
  if (sessionIds.length === 0) return { count: 0, rows: [] };

  // 2. Buscar todas as respostas para essas sessões
  const allResponsesInTheseSessions = await Resposta.findAll({
    where: { respondentSessionId: { [Op.in]: sessionIds } },
    include: [
      { model: Pergunta, as: 'pergunta', attributes: ['text', 'type'] },
      { model: Client, as: 'client', attributes: ['name'] }
    ],
    order: [['createdAt', 'ASC']]
  });

  // 3. Agrupar e formatar por sessão
  const groupedFeedbacksMap = allResponsesInTheseSessions.reduce((acc, response) => {
    const sessionId = response.respondentSessionId;
    if (!acc[sessionId]) {
      acc[sessionId] = {
        sessionId: sessionId,
        client: response.client ? { name: response.client.name } : null,
        createdAt: response.createdAt,
        responses: [],
      };
    }

    let answerValue = response.textValue || response.selectedOption;
    if (response.ratingValue !== null) {
      answerValue = response.ratingValue;
    }
    
    acc[sessionId].responses.push({
      perguntaId: response.perguntaId,
      question: response.pergunta?.text,
      answer: answerValue,
      questionType: response.pergunta?.type,
      ratingValue: response.ratingValue,
    });
    
    if (response.createdAt > new Date(acc[sessionId].createdAt)) {
      acc[sessionId].createdAt = response.createdAt;
    }

    return acc;
  }, {});

  // 4. Formatar o resultado final
  const formattedRows = Object.values(groupedFeedbacksMap).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Contagem total para paginação (baseada no número de sessões distintas)
  const totalCount = await Resposta.count({
    where: sessionFilterWhereClause,
    distinct: true,
    col: 'respondentSessionId'
  });

  return {
    count: totalCount,
    rows: formattedRows,
  };
};
const getScoresByCriteria = async (
  tenantId = null,
  startDate = null,
  endDate = null,
  surveyId = null,
) => {
  const whereClause = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  } else {
    whereClause.tenantId = { [Op.ne]: null };
  }

  const responseWhere = { ratingValue: { [Op.ne]: null } };
  if (tenantId) {
    responseWhere.tenantId = tenantId;
    whereClause.tenantId = tenantId;
  }
  if (startDate && endDate) {
    responseWhere.createdAt = { [Op.between]: [startDate, endDate] };
  }
  if (surveyId) {
    responseWhere.pesquisaId = surveyId;
  }

  const criterios = await Criterio.findAll({
    where: whereClause,
    include: [
      {
        model: Pergunta,
        as: "perguntas",
        attributes: ["id", "type"],
        include: [
          {
            model: Resposta,
            as: "respostas",
            where: responseWhere,
            required: true,
            attributes: ["ratingValue"],
          },
        ],
      },
    ],
    order: [["name", "ASC"]],
  });


  return criterios.map((criterio) => {
    const result = {
      criterion: criterio.name,
      scoreType: null,
      npsScore: 0,
      satisfactionRate: 0,
      total: 0,
      promoters: 0,
      neutrals: 0,
      detractors: 0,
      satisfied: 0,
      neutral: 0, // CSAT neutral
      unsatisfied: 0,
    };

    if (!criterio.perguntas || criterio.perguntas.length === 0) {
      return result;
    }

    const allResponses = criterio.perguntas.flatMap(p => p.respostas || []);
    if (allResponses.length === 0) {
      return result;
    }
    
    result.total = allResponses.length;

    // Lógica mais robusta para encontrar o tipo de pergunta
    let questionType = null;
    const firstQuestionWithAnswers = criterio.perguntas.find(p => p.respostas && p.respostas.length > 0);
    if(firstQuestionWithAnswers) {
        questionType = firstQuestionWithAnswers.type;
    } else {
        // Fallback se nenhuma pergunta tiver resposta, mas ainda assim houver respostas agregadas (improvável)
        // Ou se um critério não tiver perguntas com pontuação, mas só de texto, por ex.
        const firstQuestion = criterio.perguntas[0];
        if (firstQuestion) {
            questionType = firstQuestion.type;
        } else {
            return result; // Critério sem perguntas
        }
    }

    if (questionType === "rating_0_10") {
      result.scoreType = "NPS";
      const npsResult = ratingService.calculateNPS(allResponses);
      result.npsScore = npsResult.npsScore;
      result.promoters = npsResult.promoters;
      result.neutrals = npsResult.neutrals;
      result.detractors = npsResult.detractors;
    } else if (questionType === "rating_1_5" || questionType === "rating") {
      result.scoreType = "CSAT";
      result.satisfied = allResponses.filter(r => r.ratingValue >= 4).length;
      result.neutral = allResponses.filter(r => r.ratingValue === 3).length;
      result.unsatisfied = allResponses.filter(r => r.ratingValue < 3).length;
      if (result.total > 0) {
        result.satisfactionRate = parseFloat(((result.satisfied / result.total) * 100).toFixed(1));
      }
    } else {
        result.scoreType = "Outro";
    }

    return result;
  });
};

const getNpsDistribution = async (
  tenantId = null,
  startDate = null,
  endDate = null,
) => {
  const whereClause = { ratingValue: { [Op.ne]: null } };
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }

  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
  }

  const ratingResponses = await Resposta.findAll({
    where: whereClause,
    include: [
      { model: Pergunta, as: "pergunta", attributes: ["type"], required: true },
    ],
  });

  const npsResponses = ratingResponses.filter(
    (r) => r.pergunta.type === "rating_0_10",
  );
  const npsResult = ratingService.calculateNPS(npsResponses);

  return [
    { name: "Promotores", value: npsResult.promoters },
    { name: "Neutros", value: npsResult.neutrals },
    { name: "Detratores", value: npsResult.detractors },
  ];
};

const getNpsTrendData = async (
  tenantId = null,
  period = "day",
  startDate = null,
  endDate = null,
) => {
  const whereClause = { ratingValue: { [Op.ne]: null } };
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }

  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
  }

  const trendData = await Resposta.findAll({
    where: whereClause,
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: [],
        where: { type: "rating_0_10" },
        required: true,
      },
    ],
    attributes: [
      [fn("date_trunc", period, literal(`"Resposta"."createdAt" AT TIME ZONE '${TIMEZONE}'`)), "period"],
      [
        fn("SUM", literal(`CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END`)),
        "promoters",
      ],
      [
        fn("SUM", literal(`CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END`)),
        "detractors",
      ],
      [fn("COUNT", col("Resposta.id")), "total"],
    ],
    group: [fn("date_trunc", period, literal(`"Resposta"."createdAt" AT TIME ZONE '${TIMEZONE}'`))],
    order: [[fn("date_trunc", period, literal(`"Resposta"."createdAt" AT TIME ZONE '${TIMEZONE}'`)), "ASC"]],
  });

  return trendData.map((item) => {
    const { period: datePeriod, promoters: p, detractors: d, total: t } = item.dataValues;
    const promoters = parseInt(p) || 0;
    const detractors = parseInt(d) || 0;
    const total = parseInt(t) || 0;
    const nps = total > 0 ? ((promoters - detractors) / total) * 100 : 0;
    return {
      period: formatInTimeZone(
        datePeriod,
        period === "day"
          ? "dd/MM"
          : period === "week"
            ? "ww/yyyy"
            : "MM/yyyy",
      ),
      nps: parseFloat(nps.toFixed(1)),
    };
  });
};

const getEvolutionData = async (
  tenantId = null,
  period = "day",
  startDate = null,
  endDate = null,
) => {
  const whereClause = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  } else {
    whereClause.tenantId = { [Op.ne]: null };
  }
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
      [fn("date_trunc", period, literal(`"Resposta"."createdAt" AT TIME ZONE '${TIMEZONE}'`)), "period"],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "pergunta"."type" = 'rating_0_10' AND "ratingValue" >= 9 THEN 1 ELSE 0 END`,
          ),
        ),
        "promoters",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "pergunta"."type" = 'rating_0_10' AND "ratingValue" <= 6 THEN 1 ELSE 0 END`,
          ),
        ),
        "detractors",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "pergunta"."type" = 'rating_0_10' THEN 1 ELSE 0 END`,
          ),
        ),
        "nps_total",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "pergunta"."type" IN ('rating_1_5', 'rating') AND "ratingValue" >= 4 THEN 1 ELSE 0 END`,
          ),
        ),
        "satisfied",
      ],
      [
        fn(
          "SUM",
          literal(
            `CASE WHEN "pergunta"."type" IN ('rating_1_5', 'rating') THEN 1 ELSE 0 END`,
          ),
        ),
        "csat_total",
      ],
      [fn("COUNT", col("Resposta.id")), "responses"],
    ],
    include: [{ model: Pergunta, as: "pergunta", attributes: [] }],
    group: [fn("date_trunc", period, literal(`"Resposta"."createdAt" AT TIME ZONE '${TIMEZONE}'`))],
    order: [[fn("date_trunc", period, literal(`"Resposta"."createdAt" AT TIME ZONE '${TIMEZONE}'`)), "ASC"]],
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
    items.forEach((item) => {
      const periodKey = new Date(item.period).toISOString();
      if (!mergedData[periodKey]) {
        mergedData[periodKey] = {
          period: formatInTimeZone(item.period, "dd/MM/yyyy"),
          nps: 0,
          satisfaction: 0,
          responses: 0,
          registrations: 0,
        };
      }
      mergedData[periodKey][key] = valueCallback(item);
    });
  };

  processItems(responseTrends, "nps", (item) => {
    const promoters = parseInt(item.promoters) || 0;
    const detractors = parseInt(item.detractors) || 0;
    const total = parseInt(item.nps_total) || 0;
    return total > 0
      ? parseFloat((((promoters - detractors) / total) * 100).toFixed(1))
      : 0;
  });

  processItems(responseTrends, "satisfaction", (item) => {
    const satisfied = parseInt(item.satisfied) || 0;
    const total = parseInt(item.csat_total) || 0;
    return total > 0 ? parseFloat(((satisfied / total) * 100).toFixed(1)) : 0;
  });

  processItems(
    responseTrends,
    "responses",
    (item) => parseInt(item.responses) || 0,
  );
  processItems(
    registrationTrends,
    "registrations",
    (item) => parseInt(item.registrations) || 0,
  );

  return Object.values(mergedData).sort(
    (a, b) =>
      new Date(a.period.split("/").reverse().join("-")) -
      new Date(b.period.split("/").reverse().join("-")),
  );
};

const getConversionChartData = async (
  tenantId = null,
  startDate = null,
  endDate = null,
) => {
  const whereClause = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }
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

  const usedWhereClause = { tenantId, status: "used" };
  if (startDate && endDate) {
    usedWhereClause.updatedAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    usedWhereClause.updatedAt = { [Op.gte]: startDate };
  } else if (endDate) {
    usedWhereClause.updatedAt = { [Op.lte]: endDate };
  }
  const couponsUsed = await Cupom.count({ where: usedWhereClause });

  return [
    { name: "Respostas", value: totalResponses },
    { name: "Cadastros", value: totalRegistrations },
    { name: "Cupons Gerados", value: couponsGenerated },
    { name: "Cupons Utilizados", value: couponsUsed },
  ];
};

const getWordCloudData = async (
  tenantId = null,
  startDate = null,
  endDate = null,
) => {
  const whereClause = {
    textValue: { [Op.ne]: null, [Op.ne]: "" },
  };
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }

  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
  }

  const responses = await Resposta.findAll({
    where: whereClause,
    attributes: ["textValue"],
  });
  if (!responses.length) return [];

  const stopwords = new Set([
    "de",
    "a",
    "o",
    "que",
    "e",
    "do",
    "da",
    "em",
    "um",
    "para",
    "com",
    "não",
    "uma",
    "os",
    "no",
    "na",
    "por",
    "mais",
    "as",
    "dos",
    "como",
    "mas",
    "foi",
    "ao",
    "ele",
    "das",
    "tem",
    "à",
    "seu",
    "sua",
    "ou",
    "ser",
    "quando",
    "muito",
    "há",
    "nos",
    "já",
    "está",
    "eu",
    "também",
    "só",
    "pelo",
    "pela",
    "até",
    "isso",
    "ela",
    "entre",
    "era",
    "depois",
    "sem",
    "mesmo",
    "aos",
    "ter",
    "seus",
    "quem",
    "nas",
    "me",
    "esse",
    "eles",
    "estão",
    "você",
    "tinha",
    "foram",
    "essa",
    "num",
    "nem",
    "suas",
    "meu",
    "às",
    "minha",
    "têm",
    "numa",
    "pelos",
    "elas",
    "havia",
    "seja",
    "qual",
    "será",
    "nós",
    "tenho",
    "lhe",
    "deles",
    "essas",
    "esses",
    "pelas",
    "este",
    "fosse",
    "dele",
    "tu",
    "te",
    "vocês",
    "vos",
    "lhes",
    "meus",
    "minhas",
    "teu",
    "tua",
    "teus",
    "tuas",
    "nosso",
    "nossa",
    "nossos",
    "nossas",
    "dela",
    "delas",
    "esta",
    "estes",
    "estas",
    "aquele",
    "aquela",
    "aqueles",
    "aquelas",
    "isto",
    "aquilo",
    "estou",
    "está",
    "estamos",
    "estão",
    "estive",
    "esteve",
    "estivemos",
    "estiveram",
    "estava",
    "estávamos",
    "estavam",
    "estivera",
    "estivéramos",
    "esteja",
    "estejamos",
    "estejam",
    "estivesse",
    "estivéssemos",
    "estivessem",
    "estiver",
    "estivermos",
    "estiverem",
    "hei",
    "há",
    "havemos",
    "hão",
    "houve",
    "houvemos",
    "houveram",
    "houvera",
    "houvéramos",
    "haja",
    "hajamos",
    "hajam",
    "houvesse",
    "houvéssemos",
    "houvessem",
    "houver",
    "houvermos",
    "houverem",
    "houverei",
    "houverá",
    "houveremos",
    "houverão",
    "houveria",
    "houveríamos",
    "houveriam",
    "sou",
    "somos",
    "são",
    "era",
    "éramos",
    "eram",
    "fui",
    "foi",
    "fomos",
    "foram",
    "fora",
    "fôramos",
    "seja",
    "sejamos",
    "sejam",
    "fosse",
    "fôssemos",
    "fossem",
    "for",
    "formos",
    "forem",
    "serei",
    "será",
    "seremos",
    "serão",
    "seria",
    "seríamos",
    "seriam",
    "bom",
    "ótimo",
    "excelente",
    "gostei",
    "muito",
    "atendimento",
    "comida",
  ]);
  const wordCounts = {};
  responses.forEach((response) => {
    const words = response.textValue
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/);
    words.forEach((word) => {
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

const getNpsByDayOfWeek = async (
  tenantId = null,
  startDate = null,
  endDate = null,
) => {
  const whereClause = { ratingValue: { [Op.ne]: null } };
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }

  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
  }

  const npsData = await Resposta.findAll({
    where: whereClause,
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: [],
        where: { type: "rating_0_10" },
        required: true,
      },
    ],
    attributes: [
      [
        Sequelize.fn(
          "EXTRACT",
          Sequelize.literal('DOW FROM "Resposta"."createdAt"'),
        ),
        "dayOfWeek",
      ],
      [
        fn("SUM", literal(`CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END`)),
        "promoters",
      ],
      [
        fn("SUM", literal(`CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END`)),
        "detractors",
      ],
      [fn("COUNT", col("Resposta.id")), "total"],
    ],
    group: [
      Sequelize.fn(
        "EXTRACT",
        Sequelize.literal('DOW FROM "Resposta"."createdAt"'),
      ),
      "pergunta.type",
    ],
    order: [
      [
        Sequelize.fn(
          "EXTRACT",
          Sequelize.literal('DOW FROM "Resposta"."createdAt"'),
        ),
        "ASC",
      ],
    ],
  });

  const daysOfWeekNames = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  return npsData.map((item) => {
    const {
      dayOfWeek,
      promoters: p,
      detractors: d,
      total: t,
    } = item.dataValues;
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
  const whereClause = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
  }

  // 1. Obter todos os atendentes ativos e suas metas
  const attendants = await Atendente.findAll({
    where: { tenantId, status: "active" },
    include: [{ model: AtendenteMeta, as: "meta" }],
    raw: true,
    nest: true,
  });
  const attendantIds = attendants.map((a) => a.id);
  if (attendantIds.length === 0) return [];

  // 2. Calcular NPS para cada atendente
  const npsData = await Resposta.findAll({
    where: {
      ...whereClause,
      atendenteId: { [Op.in]: attendantIds },
      ratingValue: { [Op.ne]: null },
    },
    include: [{
      model: Pergunta,
      as: 'pergunta',
      where: { type: 'rating_0_10' },
      attributes: []
    }],
    attributes: [
      'atendenteId',
      [fn('SUM', literal('CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END')), 'promoters'],
      [fn('SUM', literal('CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END')), 'detractors'],
      [fn('COUNT', col('Resposta.id')), 'total'],
    ],
    group: ['atendenteId'],
    raw: true,
  });

  const npsByAttendant = npsData.reduce((acc, item) => {
    const total = parseInt(item.total, 10) || 0;
    if (total > 0) {
      const promoters = parseInt(item.promoters, 10) || 0;
      const detractors = parseInt(item.detractors, 10) || 0;
      acc[item.atendenteId] = ((promoters - detractors) / total) * 100;
    } else {
      acc[item.atendenteId] = 0;
    }
    return acc;
  }, {});

  // 3. Contar pesquisas únicas e cadastros para cada atendente
  const surveyCounts = await Resposta.findAll({
    where: { ...whereClause, atendenteId: { [Op.in]: attendantIds } },
    attributes: [
      'atendenteId',
      [fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'surveyCount'],
    ],
    group: ['atendenteId'],
    raw: true,
  });
  
  // O ideal seria ter `atendenteId` na tabela Clients. 
  // A lógica de `registrations` aqui é uma aproximação e pode não ser precisa
  // dependendo do fluxo de cadastro. Por enquanto, ela não está sendo usada no retorno.

  const countsByAttendant = surveyCounts.reduce((acc, item) => {
    acc[item.atendenteId] = {
      responses: parseInt(item.surveyCount, 10) || 0,
    };
    return acc;
  }, {});

  // 4. Montar o resultado final
  const attendantsData = attendants.map((attendant) => {
    const performance = countsByAttendant[attendant.id] || { responses: 0 };
    return {
      id: attendant.id,
      name: attendant.name,
      responses: performance.responses, // Corrigido para contar pesquisas únicas
      currentNPS: npsByAttendant[attendant.id] || 0,
      currentCSAT: 0, // A lógica de CSAT foi removida por simplicidade, pode ser adicionada depois
      npsGoal: attendant.meta?.npsGoal ? parseFloat(attendant.meta.npsGoal) : 0,
      csatGoal: 0, // A lógica de CSAT foi removida por simplicidade
    };
  });

  return attendantsData.sort((a, b) => b.currentNPS - a.currentNPS);
};

const getAttendantDetails = async (
  tenantId,
  attendantId,
  startDate,
  endDate,
) => {
  const whereClause = { atendenteId: attendantId };
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: endDate };
  }

  const attendant = await Atendente.findByPk(attendantId, {
    include: [{ model: AtendenteMeta, as: "meta" }],
  });

  if (!attendant) throw new Error("Atendente não encontrado.");

  const responses = await Resposta.findAll({
    where: whereClause,
    include: [{ model: Pergunta, as: "pergunta", attributes: ["type"] }],
  });

  responses.forEach((response) => {
    const { ratingValue, pergunta } = response;
    if (!pergunta || ratingValue === null) return;
    if (pergunta.type === "rating_1_5" || pergunta.type === "rating") {
      csatTotalScore += ratingValue;
      csatCount++;
    }
  });

  const npsResponses = responses.filter(
    (r) => r.pergunta?.type === "rating_0_10" && r.ratingValue !== null,
  );
  const npsResult = ratingService.calculateNPS(npsResponses);
  const npsScore = npsResult.npsScore;

  const csatAverageScore = csatCount > 0 ? csatTotalScore / csatCount : 0;

  const recentFeedbacks = await Resposta.findAll({
    where: { ...whereClause, textValue: { [Op.ne]: null, [Op.ne]: "" } },
    order: [["createdAt", "DESC"]],
    limit: 10,
    include: [{ model: Client, as: "client", attributes: ["name"] }],
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
    recentFeedbacks: recentFeedbacks.map((fb) => ({
      date: formatInTimeZone(fb.createdAt, "dd/MM/yyyy HH:mm"),
      client: fb.client?.name || "Anônimo",
      rating: fb.ratingValue,
      comment: fb.textValue,
      respondentSessionId: fb.respondentSessionId,
    })),
  };
};

const getResponseDetails = async (tenantId, sessionId) => {
  const whereClause = { respondentSessionId: sessionId };
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }

  const responses = await Resposta.findAll({
    where: whereClause,
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: ["text", "type", "options"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  if (!responses || responses.length === 0) return [];

  return responses.map((r) => {
    let answer = r.textValue || r.selectedOption;
    if (r.ratingValue !== null) answer = r.ratingValue.toString();
    return {
      Pergunta: r.pergunta.text,
      Resposta: answer,
      Data: formatInTimeZone(r.createdAt, "dd/MM/yyyy HH:mm"),
    };
  });
};

const getDemographicsData = async (tenantId, startDate, endDate) => {
  const whereClause = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }
  const dateFilter = {};
  if (startDate) dateFilter[Op.gte] = startDate;
  if (endDate) dateFilter[Op.lte] = endDate;
  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  const clients = await Client.findAll({
    where: whereClause,
    attributes: ["gender", "birthDate"],
  });
  const genderDistribution = {
    Masculino: 0,
    Feminino: 0,
    Outro: 0,
    "Não informado": 0,
  };
  const ageDistribution = {
    "0-17": 0,
    "18-24": 0,
    "25-34": 0,
    "35-44": 0,
    "45-54": 0,
    "55+": 0,
    "N/A": 0,
  };

  clients.forEach((client) => {
    if (client.gender) {
      const gender = client.gender.toLowerCase();
      if (gender === "masculino" || gender === "m")
        genderDistribution["Masculino"]++;
      else if (gender === "feminino" || gender === "f")
        genderDistribution["Feminino"]++;
      else genderDistribution["Outro"]++;
    } else {
      genderDistribution["Não informado"]++;
    }

    if (client.birthDate) {
      const age =
        new Date().getFullYear() - new Date(client.birthDate).getFullYear();
      if (age <= 17) ageDistribution["0-17"]++;
      else if (age <= 24) ageDistribution["18-24"]++;
      else if (age <= 34) ageDistribution["25-34"]++;
      else if (age <= 44) ageDistribution["35-44"]++;
      else if (age <= 54) ageDistribution["45-54"]++;
      else ageDistribution["55+"]++;
    } else {
      ageDistribution["N/A"]++;
    }
  });

  return { genderDistribution, ageDistribution };
};

const getDetails = async (tenantId, startDate, endDate, category) => {
  const where = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      where.tenantId = { [Op.in]: tenantId };
    } else {
      where.tenantId = tenantId;
    }
  } else {
    where.tenantId = { [Op.ne]: null };
  }
  
  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.createdAt = { [Op.gte]: startDate };
  } else if (endDate) {
    where.createdAt = { [Op.lte]: endDate };
  }

  const includeClient = {
    model: Client,
    as: "client",
    attributes: ["id", "name", "phone"],
    required: false,
  };
  const formatResponse = (r) => ({
    id: r.id,
    Data: formatInTimeZone(r.createdAt, "dd/MM/yyyy HH:mm"),
    Cliente: r.client?.name || "Anônimo",
    Telefone: r.client?.phone,
    Nota: r.ratingValue,
    Comentário: r.textValue,
  });

  switch (category) {
    case "total-respostas": {
      const responses = await Resposta.findAll({
        where,
        include: [includeClient],
        order: [["createdAt", "DESC"]],
      });
      return responses.map(formatResponse);
    }
    case "nps-geral":
    case "promotores":
    case "neutros":
    case "detratores": {
      const npsWhere = { ...where, ratingValue: { [Op.ne]: null } };
      if (category === "promotores") npsWhere.ratingValue = { [Op.gte]: 9 };
      if (category === "neutros")
        npsWhere.ratingValue = { [Op.between]: [7, 8] };
      if (category === "detratores") npsWhere.ratingValue = { [Op.lte]: 6 };

      const responses = await Resposta.findAll({
        where: npsWhere,
        include: [
          includeClient,
          {
            model: Pergunta,
            as: "pergunta",
            where: { type: "rating_0_10" },
            attributes: ["text", "id"],
            required: true,
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return responses;
    }
    case "csat-geral":
    case "satisfeitos":
    case "insatisfeitos": {
      const csatWhere = { ...where, ratingValue: { [Op.ne]: null } };
      if (category === "satisfeitos") csatWhere.ratingValue = { [Op.gte]: 4 };
      if (category === "insatisfeitos") csatWhere.ratingValue = { [Op.lte]: 3 };

      const responses = await Resposta.findAll({
        where: csatWhere,
        include: [
          includeClient,
          {
            model: Pergunta,
            as: "pergunta",
            where: { type: { [Op.in]: ["rating_1_5", "rating"] } },
            attributes: ["text", "id"],
            required: true,
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return responses;
    }
    case "cadastros": {
      const clients = await Client.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });
      return clients.map((c) => ({
        id: c.id,
        Data: formatInTimeZone(c.createdAt, "dd/MM/yyyy HH:mm"),
        Nome: c.name,
        Telefone: c.phone,
        Email: c.email,
        Aniversário: c.birthday
          ? formatInTimeZone(c.birthday, "dd/MM/yyyy")
          : null,
      }));
    }
    case "aniversariantes": {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const birthdayWhere = {
        tenantId: tenantId || { [Op.ne]: null },
        [Op.and]: [
          Sequelize.literal(
            `EXTRACT(MONTH FROM "birthDate") = ${currentMonth}`,
          ),
        ],
      };
      const clients = await Client.findAll({
        where: birthdayWhere,
        order: [["name", "ASC"]],
      });
      return clients.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        birthDate: c.birthDate,
      }));
    }
    case "cupons-gerados": {
      const coupons = await Cupom.findAll({
        where,
        include: [{ model: Client, as: "client", attributes: ["name"] }],
        order: [["createdAt", "DESC"]],
      });
      return coupons.map((c) => ({
        id: c.id,
        createdAt: c.createdAt,
        client: c.client,
        code: c.code,
        status: c.status,
        dataValidade: c.dataValidade,
      }));
    }
    case "cupons-utilizados": {
      const usedWhere = {
        tenantId: tenantId || { [Op.ne]: null },
        status: "used",
      };
      if (startDate && endDate) {
        usedWhere.updatedAt = { [Op.between]: [startDate, endDate] };
      } else if (startDate) {
        usedWhere.updatedAt = { [Op.gte]: startDate };
      } else if (endDate) {
        usedWhere.updatedAt = { [Op.lte]: endDate };
      }
      const coupons = await Cupom.findAll({
        where: usedWhere,
        include: [{ model: Client, as: "client", attributes: ["name"] }],
        order: [["updatedAt", "DESC"]],
      });
      return coupons.map((c) => ({
        id: c.id,
        updatedAt: c.updatedAt,
        client: c.client,
        code: c.code,
        status: c.status,
      }));
    }
    default:
      return [];
  }
};

const getMonthSummaryData = async (tenantId, startDate, endDate) => {
  const whereClause = { tenantId: tenantId || { [Op.ne]: null } };
  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  }

  const responses = await Resposta.findAll({
    where: whereClause,
    attributes: ["id", "createdAt", "respondentSessionId", "ratingValue"],
    include: [{ model: Pergunta, as: "pergunta", attributes: ["type"] }],
    order: [["createdAt", "ASC"]],
  });

  const totalResponses = responses.length;
  const responsesByDate = {};
  responses.forEach((r) => {
    if (r.pergunta?.type !== "rating_0_10") return;
    const date = formatInTimeZone(r.createdAt, "yyyy-MM-dd");
    if (!responsesByDate[date]) responsesByDate[date] = [];
    responsesByDate[date].push(r);
  });

  let accumulatedPromoters = 0,
    accumulatedDetractors = 0,
    accumulatedTotal = 0;
  const dailyNps = Object.keys(responsesByDate)
    .sort()
    .map((date) => {
      const dailyResponses = responsesByDate[date];
      const dayResult = ratingService.calculateNPS(dailyResponses);
      
      accumulatedPromoters += dayResult.promoters;
      accumulatedDetractors += dayResult.detractors;
      accumulatedTotal += dayResult.total;

      const dailyNpsScore = dayResult.npsScore;
      const accumulatedNpsScore =
        accumulatedTotal > 0
          ? ((accumulatedPromoters - accumulatedDetractors) /
              accumulatedTotal) *
            100
          : 0;

      return {
        date: formatInTimeZone(new Date(date), "dd/MM"),
        nps: dailyNpsScore,
        accumulatedNps: parseFloat(accumulatedNpsScore.toFixed(1)),
      };
    });

  const peakHours = Array(24)
    .fill(0)
    .reduce(
      (acc, _, i) => ({ ...acc, [i.toString().padStart(2, "0")]: 0 }),
      {},
    );
  responses.forEach((r) => {
    const hour = formatInTimeZone(r.createdAt, "HH");
    if (peakHours[hour] !== undefined) peakHours[hour]++;
  });
  const peakHoursData = Object.keys(peakHours).map((hour) => ({
    hour,
    count: peakHours[hour],
  }));

  const daysOfWeekNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weekdayDistribution = Array(7)
    .fill(0)
    .map((_, i) => ({ day: daysOfWeekNames[i], count: 0 }));
  responses.forEach(
    (r) => weekdayDistribution[new Date(r.createdAt).getUTCDay()].count++,
  );

  const respondentSessionIds = [
    ...new Set(responses.map((r) => r.respondentSessionId).filter((id) => id)),
  ];
  const registeredClients =
    respondentSessionIds.length > 0
      ? await Client.count({
          where: {
            tenantId,
            respondentSessionId: { [Op.in]: respondentSessionIds },
          },
        })
      : 0;
  const clientProportion = {
    registered: registeredClients,
    unregistered: respondentSessionIds.length - registeredClients,
  };

  return {
    totalResponses,
    dailyNps,
    peakHours: peakHoursData,
    weekdayDistribution,
    clientProportion,
  };
};

const getDashboardData = async (
  tenantId = null,
  startDate = null,
  endDate = null,
  period = "day",
  surveyId = null,
) => {
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
    getScoresByCriteria(tenantId, startDate, endDate, surveyId),
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

const getTopClientsByResponses = async (tenantId, limit = 10) => {
  const whereClause = {};
  if (tenantId) {
    if (Array.isArray(tenantId)) {
      whereClause.tenantId = { [Op.in]: tenantId };
    } else {
      whereClause.tenantId = tenantId;
    }
  }

  return Client.findAll({
    where: whereClause,
    attributes: [
      'id',
      'name',
      'phone',
      [Sequelize.fn('COUNT', Sequelize.col('respostas.id')), 'responseCount']
    ],
    include: [{
      model: Resposta,
      as: 'respostas',
      attributes: [],
      required: true,
    }],
    group: ['Client.id'],
    order: [[Sequelize.literal('"responseCount"'), 'DESC']],
    limit,
    subQuery: false,
  });
};

const getTopClientsByRedemptions = async (tenantId, limit = 10) => {
    const whereClause = {
        status: 'used'
    };
    if (tenantId) {
        if (Array.isArray(tenantId)) {
            whereClause.tenantId = { [Op.in]: tenantId };
        } else {
            whereClause.tenantId = tenantId;
        }
    }

    return Cupom.findAll({
        where: whereClause,
        attributes: [
            'clienteId',
            [Sequelize.fn('COUNT', Sequelize.col('Cupom.id')), 'redemptionCount']
        ],
        include: [{
            model: Client,
            as: 'client',
            attributes: ['name', 'phone'],
            required: true
        }],
        group: ['clienteId', 'client.id'],
        order: [[Sequelize.literal('"redemptionCount" DESC')]],
        limit,
    });
};

const getAttendantResponsesTimeseries = async (tenantId, period, startDate, endDate, atendenteId = null) => {
  const whereClause = {
    tenantId: tenantId,
    atendenteId: { [Op.ne]: null },
  };

  if (startDate && endDate) {
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  }

  if (atendenteId) {
    whereClause.atendenteId = atendenteId;
  }

  const responses = await Resposta.findAll({
    where: whereClause,
    attributes: [
      'atendenteId',
      [fn('date_trunc', period, col('Resposta.createdAt')), 'period'],
      [fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'count'],
    ],
    include: [{ model: Atendente, as: 'atendente', attributes: ['name'], required: true }],
    group: ['atendenteId', 'atendente.id', 'period'],
    order: [['period', 'ASC']],
    raw: true,
    nest: true,
  });

  const series = {};
  responses.forEach(item => {
    const attendantName = item.atendente.name;
    if (!series[attendantName]) {
      series[attendantName] = [];
    }
    const formattedPeriod = formatInTimeZone(item.period, 'yyyy-MM-dd');
    
    const existingEntry = series[attendantName].find(e => e.period === formattedPeriod);
    if (existingEntry) {
        existingEntry.count += parseInt(item.count, 10);
    } else {
        series[attendantName].push({
          period: formattedPeriod,
          count: parseInt(item.count, 10),
        });
    }
  });

  const allPeriods = [...new Set(responses.map(item => formatInTimeZone(item.period, 'yyyy-MM-dd')))].sort();

  for (const attendantName in series) {
    const existingPeriods = new Set(series[attendantName].map(e => e.period));
    const filledSeries = [];
    for (const period of allPeriods) {
        if (existingPeriods.has(period)) {
            filledSeries.push(series[attendantName].find(e => e.period === period));
        } else {
            filledSeries.push({ period, count: 0 });
        }
    }
    series[attendantName] = filledSeries;
  }

  return series;
};

const dashboardRepository = {
  getSummary,
  getSurveysRespondedChart,
  getResponseChart,
  getFeedbacks,
  getScoresByCriteria,
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
  getTopClientsByResponses,
  getTopClientsByRedemptions,
  getAttendantResponsesTimeseries,
};

module.exports = dashboardRepository;
