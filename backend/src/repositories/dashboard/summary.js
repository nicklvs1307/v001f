const {
  Resposta,
  Pergunta,
  Client,
  Cupom,
  sequelize,
} = require("../../../models");
const { Op } = require("sequelize");
const { TIMEZONE, getUtcDateRange } = require("../../utils/dateUtils");
const { getBirthdaysOfMonth } = require("./clients");
const ratingService = require("../../services/ratingService");

const getSummary = async (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const { startDate, endDate } = getUtcDateRange(startDateStr, endDateStr);

  const where = { tenantId };
  if (surveyId) {
    where.pesquisaId = surveyId;
  }
  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [startDate, endDate] };
  }

  const [summaryData] = await Resposta.findAll({
    attributes: [
      [
        sequelize.literal(
          "SUM(CASE WHEN \"pergunta\".\"type\" = 'rating_0_10' THEN 1 ELSE 0 END)",
        ),
        "npsCount",
      ],
      [
        sequelize.literal(
          "SUM(CASE WHEN \"pergunta\".\"type\" = 'rating_0_10' AND \"Resposta\".\"ratingValue\" >= 9 THEN 1 ELSE 0 END)",
        ),
        "promoters",
      ],
      [
        sequelize.literal(
          "SUM(CASE WHEN \"pergunta\".\"type\" = 'rating_0_10' AND \"Resposta\".\"ratingValue\" >= 7 AND \"Resposta\".\"ratingValue\" <= 8 THEN 1 ELSE 0 END)",
        ),
        "neutrals",
      ],
      [
        sequelize.literal(
          "SUM(CASE WHEN \"pergunta\".\"type\" = 'rating_0_10' AND \"Resposta\".\"ratingValue\" <= 6 THEN 1 ELSE 0 END)",
        ),
        "detractors",
      ],
      [
        sequelize.literal(
          "SUM(CASE WHEN \"pergunta\".\"type\" = 'rating_1_5' THEN 1 ELSE 0 END)",
        ),
        "csatCount",
      ],
      [
        sequelize.literal(
          "SUM(CASE WHEN \"pergunta\".\"type\" = 'rating_1_5' THEN \"Resposta\".\"ratingValue\" ELSE 0 END)",
        ),
        "csatSum",
      ],
      [
        sequelize.fn("COUNT", sequelize.fn("DISTINCT", sequelize.col("respondentSessionId"))),
        "totalResponses",
      ],
    ],
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: [],
        required: true,
      },
    ],
    where,
    raw: true,
  });

  const couponsQuery = {
    attributes: [
      [
        sequelize.fn("COUNT", sequelize.col("id")),
        "couponsGenerated",
      ],
      [
        sequelize.literal("SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END)"),
        "couponsUsed",
      ],
    ],
    where,
    raw: true,
  };

  const [couponsData, birthdays, totalUsers] = await Promise.all([
    Cupom.findOne(couponsQuery),
    getBirthdaysOfMonth(tenantId, startDate, endDate),
    Client.count({ where: { tenantId } }),
  ]);

  const npsScore =
    summaryData.npsCount > 0
      ? ((summaryData.promoters - summaryData.detractors) / summaryData.npsCount) * 100
      : 0;

  const csatScore =
    summaryData.csatCount > 0
      ? (summaryData.csatSum / summaryData.csatCount) * 20
      : 0;

  return {
    nps: {
      score: npsScore,
      promoters: summaryData.promoters,
      neutrals: summaryData.neutrals,
      detractors: summaryData.detractors,
      total: summaryData.npsCount,
    },
    csat: {
      satisfactionRate: csatScore,
      total: summaryData.csatCount,
    },
    registrations: totalUsers,
    registrationsConversion:
      summaryData.totalResponses > 0
        ? parseFloat(((totalUsers / summaryData.totalResponses) * 100).toFixed(2))
        : 0,
    couponsGenerated: couponsData.couponsGenerated,
    couponsUsed: couponsData.couponsUsed,
    couponsUsedConversion:
      couponsData.couponsGenerated > 0
        ? parseFloat(((couponsData.couponsUsed / couponsData.couponsGenerated) * 100).toFixed(2))
        : 0,
    totalResponses: summaryData.totalResponses,
    totalUsers,
    ambassadorsInPeriod: summaryData.promoters,
    ambassadorsMonth: birthdays.length,
  };
};

const getMonthlySummary = async (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
) => {
  const { startDate, endDate } = getUtcDateRange(startDateStr, endDateStr);

  const where = { tenantId };
  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [startDate, endDate] };
  }

  const query = {
    attributes: [
      [
        sequelize.fn("DATE", sequelize.col("createdAt")),
        "date",
      ],
      [
        sequelize.literal("EXTRACT(HOUR FROM createdAt AT TIME ZONE 'UTC')"),
        "hour",
      ],
      [
        sequelize.literal("EXTRACT(ISODOW FROM createdAt AT TIME ZONE 'UTC')"),
        "weekday",
      ],
      [
        sequelize.literal("SUM(CASE WHEN \"pergunta\".\"type\" = 'rating_0_10' THEN 1 ELSE 0 END)"),
        "npsCount",
      ],
      [
        sequelize.literal(
          "SUM(CASE WHEN \"pergunta\".\"type\" = 'rating_0_10' AND \"Resposta\".\"ratingValue\" >= 9 THEN 1 ELSE 0 END)",
        ),
        "promoters",
      ],
      [
        sequelize.literal(
          "SUM(CASE WHEN \"pergunta\".\"type\" = 'rating_0_10' AND \"Resposta\".\"ratingValue\" >= 7 AND \"Resposta\".\"ratingValue\" <= 8 THEN 1 ELSE 0 END)",
        ),
        "neutrals",
      ],
      [
        sequelize.literal(
          "SUM(CASE WHEN \"pergunta\".\"type\" = 'rating_0_10' AND \"Resposta\".\"ratingValue\" <= 6 THEN 1 ELSE 0 END)",
        ),
        "detractors",
      ],
      [
        sequelize.literal("COUNT(CASE WHEN \"client\".\"id\" IS NOT NULL THEN 1 END)"),
        "registeredResponses",
      ],
    ],
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: [],
        required: true,
      },
      {
        model: Client,
        as: "client",
        attributes: [],
      },
    ],
    where,
    group: ["date", "hour", "weekday"],
    raw: true,
  };

  const results = await Resposta.findAll(query);

  const dailyNps = {};
  const peakHours = {};
  const weekdayDistribution = {};
  let totalResponses = 0;
  let registeredResponses = 0;

  results.forEach((row) => {
    const {
      date,
      hour,
      weekday,
      npsCount,
      promoters,
      neutrals,
      detractors,
      registeredResponses: registered,
    } = row;

    if (!dailyNps[date]) {
      dailyNps[date] = {
        promoters: 0,
        neutrals: 0,
        detractors: 0,
        total: 0,
      };
    }
    dailyNps[date].promoters += promoters;
    dailyNps[date].neutrals += neutrals;
    dailyNps[date].detractors += detractors;
    dailyNps[date].total += npsCount;

    if (!peakHours[hour]) {
      peakHours[hour] = 0;
    }
    peakHours[hour] += 1;

    if (!weekdayDistribution[weekday]) {
      weekdayDistribution[weekday] = 0;
    }
    weekdayDistribution[weekday] += 1;

    totalResponses += 1;
    registeredResponses += registered;
  });

  const dailyNpsArray = Object.keys(dailyNps).map((date) => {
    const { promoters, neutrals, detractors, total } = dailyNps[date];
    const npsScore =
      total > 0 ? ((promoters - detractors) / total) * 100 : 0;
    return {
      date,
      promoters,
      neutrals,
      detractors,
      nps: parseFloat(npsScore.toFixed(1)),
    };
  });

  const weekdays = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
  ];
  const weekdayDistributionArray = Object.keys(weekdayDistribution).map(
    (weekday) => ({
      day: weekdays[weekday - 1],
      count: weekdayDistribution[weekday],
    }),
  );

  return {
    dailyNps: dailyNpsArray,
    peakHours: Object.keys(peakHours).map((hour) => ({
      hour: parseInt(hour),
      count: peakHours[hour],
    })),
    weekdayDistribution: weekdayDistributionArray,
    totalResponses,
    clientProportion: {
      registered: registeredResponses,
      unregistered: totalResponses - registeredResponses,
      total: totalResponses,
    },
  };
};

module.exports = {
  getSummary,
  getMonthlySummary,
};
