const {
  Pesquisa,
  Resposta,
  Client,
  Cupom,
  Pergunta,
} = require("../../../models");
const { Sequelize, Op } = require("sequelize");
const { eachDayOfInterval, format, subDays } = require("date-fns");
const { TIMEZONE, now, getUtcDateRange } = require("../../utils/dateUtils");
const { buildWhereClause } = require("../../utils/filterUtils");

const { fn, col, literal } = Sequelize;

// Helper para formatar a data diretamente no PostgreSQL, evitando problemas de fuso horário no JS
const formatDateTz = (period, column) => {
  const quotedColumn = column
    .split(".")
    .map((part) => `"${part}"`)
    .join(".");
  const zonedColumn = `(${quotedColumn} AT TIME ZONE 'UTC' AT TIME ZONE '${TIMEZONE}')`;

  let formatString;
  switch (period) {
    case "week":
      formatString = "YYYY-WW";
      break;
    case "month":
      formatString = "YYYY-MM";
      break;
    case "day":
    default:
      formatString = "DD/MM/YYYY";
      break;
  }
  return fn("TO_CHAR", literal(zonedColumn), formatString);
};

const getResponseChart = async (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  let dateRange = getUtcDateRange(startDateStr, endDateStr);

  // Default to the last 30 days if no date range is provided
  if (!dateRange.startDate || !dateRange.endDate) {
    const thirtyDaysAgo = subDays(now(), 30);
    dateRange = { startDate: thirtyDaysAgo, endDate: now() };
  }

  const whereClause = buildWhereClause({ tenantId, surveyId, dateRange });

  const responsesByPeriod = await Resposta.findAll({
    where: whereClause,
    attributes: [
      [formatDateTz("day", "Resposta.createdAt"), "period"],
      [fn("COUNT", fn("DISTINCT", col("respondentSessionId"))), "count"],
    ],
    group: ["period"],
    order: [[literal('MIN("Resposta"."createdAt")'), "ASC"]],
    raw: true,
  });

  const dataMap = new Map(
    responsesByPeriod.map((item) => [item.period, parseInt(item.count, 10)]),
  );

  const intervalDays = eachDayOfInterval({
    start: dateRange.startDate,
    end: dateRange.endDate,
  });

  const chartData = intervalDays.map((day) => {
    const key = format(day, "dd/MM/yyyy");
    return {
      name: format(day, "dd/MM"),
      Respostas: dataMap.get(key) || 0,
    };
  });

  return chartData;
};

const getConversionChart = async (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const responseWhere = buildWhereClause({ tenantId, surveyId, dateRange });

  const totalResponses = await Resposta.count({
    where: responseWhere,
    distinct: true,
    col: "respondentSessionId",
  });

  let totalUsers = 0;
  if (surveyId) {
    const responses = await Resposta.findAll({
      attributes: [[fn("DISTINCT", col("respondentSessionId")), "sessionId"]],
      where: {
        pesquisaId: surveyId,
        tenantId: tenantId,
        ...(responseWhere.createdAt && { createdAt: responseWhere.createdAt }),
      },
      raw: true,
    });
    const sessionIds = responses.map((r) => r.sessionId);
    if (sessionIds.length > 0) {
      totalUsers = await Client.count({
        where: {
          tenantId: tenantId,
          respondentSessionId: { [Op.in]: sessionIds },
        },
      });
    }
  } else {
    const clientWhere = buildWhereClause({ tenantId, dateRange });
    totalUsers = await Client.count({ where: clientWhere });
  }

  const cupomWhere = buildWhereClause({ tenantId, surveyId, dateRange });
  const couponsGenerated = await Cupom.count({ where: cupomWhere });

  const couponsUsedWhere = buildWhereClause({
    tenantId,
    surveyId,
    dateRange,
    dateField: "updatedAt",
  });
  couponsUsedWhere.status = "used";

  const couponsUsed = await Cupom.count({ where: couponsUsedWhere });

  return [
    { name: "Respostas", value: totalResponses },
    { name: "Cadastros", value: totalUsers },
    { name: "Cupons Gerados", value: couponsGenerated },
    { name: "Cupons Utilizados", value: couponsUsed },
  ];
};

const getNpsTrendData = async (
  tenantId = null,
  period = "day",
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const whereClause = buildWhereClause({ tenantId, surveyId, dateRange });
  whereClause.ratingValue = { [Op.ne]: null };

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
      [formatDateTz(period, "Resposta.createdAt"), "period"],
      [
        fn("SUM", literal('CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END')),
        "promoters",
      ],
      [
        fn("SUM", literal('CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END')),
        "detractors",
      ],
      [fn("COUNT", col("Resposta.id")), "total"],
    ],
    group: [formatDateTz(period, "Resposta.createdAt")],
    order: [[literal('MIN("Resposta"."createdAt")'), "ASC"]],
    raw: true,
  });

  return trendData.map((data) => {
    const promoters = parseInt(data.promoters) || 0;
    const detractors = parseInt(data.detractors) || 0;
    const total = parseInt(data.total) || 0;
    const nps =
      total > 0 ? (promoters / total) * 100 - (detractors / total) * 100 : 0;
    return {
      period: data.period,
      nps: parseFloat(nps.toFixed(1)),
    };
  });
};

const getCsatTrendData = async (
  tenantId = null,
  period = "day",
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const whereClause = buildWhereClause({ tenantId, surveyId, dateRange });
  whereClause.ratingValue = { [Op.ne]: null };

  const trendData = await Resposta.findAll({
    where: whereClause,
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: [],
        where: { type: "rating_1_5" },
        required: true,
      },
    ],
    attributes: [
      [formatDateTz(period, "Resposta.createdAt"), "period"],
      [
        fn("SUM", literal('CASE WHEN "ratingValue" >= 4 THEN 1 ELSE 0 END')),
        "satisfied",
      ],
      [fn("COUNT", col("Resposta.id")), "total"],
    ],
    group: [formatDateTz(period, "Resposta.createdAt")],
    order: [[literal('MIN("Resposta"."createdAt")'), "ASC"]],
    raw: true,
  });

  return trendData.map((data) => {
    const satisfied = parseInt(data.satisfied) || 0;
    const total = parseInt(data.total) || 0;
    const satisfactionRate = total > 0 ? (satisfied / total) * 100 : 0;
    return {
      period: data.period,
      satisfaction: parseFloat(satisfactionRate.toFixed(1)),
    };
  });
};

const getResponseCountTrendData = async (
  tenantId = null,
  period = "day",
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const whereClause = buildWhereClause({ tenantId, surveyId, dateRange });

  const trendData = await Resposta.findAll({
    where: whereClause,
    attributes: [
      [formatDateTz(period, "Resposta.createdAt"), "period"],
      [fn("COUNT", fn("DISTINCT", col("respondentSessionId"))), "count"],
    ],
    group: [formatDateTz(period, "Resposta.createdAt")],
    order: [[literal('MIN("Resposta"."createdAt")'), "ASC"]],
    raw: true,
  });

  return trendData.map((item) => ({
    period: item.period,
    responses: parseInt(item.count),
  }));
};

const getRegistrationTrendData = async (
  tenantId = null,
  period = "day",
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const whereClause = buildWhereClause({ tenantId, surveyId, dateRange });

  const trendData = await Client.findAll({
    where: whereClause,
    attributes: [
      [formatDateTz(period, "Client.createdAt"), "period"],
      [fn("COUNT", col("id")), "count"],
    ],
    group: [formatDateTz(period, "Client.createdAt")],
    order: [[literal('MIN("Client"."createdAt")'), "ASC"]],
    raw: true,
  });

  return trendData.map((item) => ({
    period: item.period,
    registrations: parseInt(item.count),
  }));
};

const getEvolutionDashboard = async (
  tenantId = null,
  period = "day",
  startDateStr = null,
  endDateStr = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);

  const npsTrend = await getNpsTrendData(
    tenantId,
    period,
    dateRange.startDate,
    dateRange.endDate,
  );
  const csatTrend = await getCsatTrendData(
    tenantId,
    period,
    dateRange.startDate,
    dateRange.endDate,
  );
  const responseCountTrend = await getResponseCountTrendData(
    tenantId,
    period,
    dateRange.startDate,
    dateRange.endDate,
  );
  const registrationTrend = await getRegistrationTrendData(
    tenantId,
    period,
    dateRange.startDate,
    dateRange.endDate,
  );

  const evolutionData = {};

  const processTrend = (trend, key) => {
    trend.forEach((item) => {
      if (!evolutionData[item.period]) {
        evolutionData[item.period] = { period: item.period };
      }
      evolutionData[item.period][key] = item[key];
    });
  };

  processTrend(npsTrend, "nps");
  processTrend(csatTrend, "satisfaction");
  processTrend(responseCountTrend, "responses");
  processTrend(registrationTrend, "registrations");

  return Object.values(evolutionData).sort((a, b) => {
    const dateA = new Date(a.period.split("/").reverse().join("-"));
    const dateB = new Date(b.period.split("/").reverse().join("-"));
    return dateA - dateB;
  });
};

module.exports = {
  getResponseChart,
  getConversionChart,
  getNpsTrendData,
  getCsatTrendData,
  getResponseCountTrendData,
  getRegistrationTrendData,
  getEvolutionDashboard,
};
