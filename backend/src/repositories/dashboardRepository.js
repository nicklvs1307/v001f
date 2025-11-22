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

    const npsData = await Pergunta.findAll({
      attributes: [
        "id",
        "text",
        [
          fn(
            "SUM",
            literal(`CASE WHEN "respostas"."ratingValue" >= 9 THEN 1 ELSE 0 END`),
          ),
          "promoters",
        ],
        [
          fn(
            "SUM",
            literal(`CASE WHEN "respostas"."ratingValue" <= 6 THEN 1 ELSE 0 END`),
          ),
          "detractors",
        ],
        [fn("COUNT", col("respostas.id")), "total"],
      ],
      include: [
        {
          model: Resposta,
          as: "respostas",
          attributes: [],
          where: responseWhereClause,
          required: true,
          include: [
            {
              model: Criterio,
              as: "criterio",
              attributes: ["name"],
            },
          ],
        },
      ],
      group: ["Pergunta.id", "Pergunta.text", "respostas->criterio.id"],
      where: {
        type: { [Op.like]: "rating%" },
        criterioId: { [Op.ne]: null },
      },
    });

    const criteriaMap = new Map();
    npsData.forEach((item) => {
      const criterioName =
        item.respostas?.[0]?.criterio?.name || "Sem Critério";
      if (!criteriaMap.has(criterioName)) {
        criteriaMap.set(criterioName, {
          promoters: 0,
          detractors: 0,
          total: 0,
        });
      }
      const stats = criteriaMap.get(criterioName);
      stats.promoters += parseInt(item.dataValues.promoters) || 0;
      stats.detractors += parseInt(item.dataValues.detractors) || 0;
      stats.total += parseInt(item.dataValues.total) || 0;
    });

    const result = [];
    criteriaMap.forEach((stats, name) => {
      let nps = 0;
      if (stats.total > 0) {
        nps =
          (stats.promoters / stats.total) * 100 -
          (stats.detractors / stats.total) * 100;
      }
      result.push({
        name,
        nps: parseFloat(nps.toFixed(1)),
      });
    });

    return result;
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
    ]);

    return {
      summary,
      responseChart,
      npsTrend,
      npsDistribution,
      npsByCriteria,
      feedbacks,
    };
  },
};

module.exports = dashboardRepository;