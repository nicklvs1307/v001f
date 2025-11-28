// Repositório para cálculos de NPS para o dashboard.
const { Resposta, Pergunta, sequelize } = require("../../../models");
const { Op } = require("sequelize");
const { TIMEZONE, getUtcDateRange } = require("../../utils/dateUtils");
const { buildWhereClause } = require("../../utils/filterUtils");
const ratingService = require("../../services/ratingService");

const getNpsByDayOfWeek = async (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const whereClause = buildWhereClause({ tenantId, surveyId, dateRange });
  whereClause.ratingValue = { [Op.ne]: null };

  const responses = await Resposta.findAll({
    where: whereClause,
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: ["type"],
        where: {
          type: "rating_0_10",
        },
        required: true,
      },
    ],
    attributes: [
      "ratingValue",
      [
        sequelize.fn(
          "EXTRACT",
          sequelize.literal(
            `ISODOW FROM "Resposta"."createdAt" AT TIME ZONE '${TIMEZONE}'`,
          ),
        ),
        "dayOfWeek",
      ],
    ],
  });

  const npsByDay = {
    Domingo: { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
    "Segunda-feira": { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
    "Terça-feira": { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
    "Quarta-feira": { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
    "Quinta-feira": { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
    "Sexta-feira": { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
    Sábado: { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
  };

  const daysOfWeek = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  responses.forEach((response) => {
    const dayOfWeek = response.get("dayOfWeek"); // 1 for Monday, 7 for Sunday
    const dayName = daysOfWeek[dayOfWeek % 7]; // Map Sunday (7) to index 0

    const classification = ratingService.classifyNPS(response.ratingValue);

    if (classification) {
      npsByDay[dayName].total++;
      if (classification === "promoter") npsByDay[dayName].promoters++;
      else if (classification === "neutral") npsByDay[dayName].neutrals++;
      else if (classification === "detractor") npsByDay[dayName].detractors++;
    }
  });

  const result = Object.entries(npsByDay).map(([day, counts]) => {
    const npsScore = ratingService.calculateNPSFromCounts(counts);
    return {
      day,
      nps: npsScore,
    };
  });

  return result;
};

module.exports = {
  getNpsByDayOfWeek,
};
