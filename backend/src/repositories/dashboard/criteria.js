const { Resposta, Pergunta, Criterio } = require("../../../models");
const { Op } = require("sequelize");
const { subDays } = require("date-fns");
const { convertToTimeZone } = require("../../../utils/dateUtils");
const ratingService = require("../../services/ratingService");

const getCriteriaScores = async (
  tenantId = null,
  startDate = null,
  endDate = null,
  surveyId = null,
) => {
  const responseWhereClause = { ratingValue: { [Op.ne]: null } };
  if (tenantId) {
    responseWhereClause.tenantId = tenantId;
  }
  if (surveyId) {
    responseWhereClause.pesquisaId = surveyId;
  }
  if (startDate || endDate) {
    const endInput = endDate ? new Date(`${endDate}T23:59:59.999`) : new Date();
    const end = convertToTimeZone(endInput);

    const startInput = startDate
      ? new Date(`${startDate}T00:00:00.000`)
      : subDays(endInput, 6);
    const start = convertToTimeZone(startInput);

    responseWhereClause.createdAt = { [Op.gte]: start, [Op.lte]: end };
  }

  const allRatingResponses = await Resposta.findAll({
    where: responseWhereClause,
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: ["id", "text", "type", "criterioId"],
        where: { type: { [Op.like]: "rating%" } },
        required: true,
        include: [
          {
            model: Criterio,
            as: "criterio",
            attributes: ["name", "type"], // Include criterio type
          },
        ],
      },
    ],
  });

  const responsesByCriteria = allRatingResponses.reduce((acc, response) => {
    const criteriaName = response.pergunta.criterio
      ? response.pergunta.criterio.name
      : "Sem Critério";
    if (!acc[criteriaName]) {
      acc[criteriaName] = {
        responses: [],
        // Assuming all questions under a criterion have the same type, which they should.
        // We can grab the type from the first response.
        type: response.pergunta.criterio
          ? response.pergunta.criterio.type
          : null,
      };
    }
    acc[criteriaName].responses.push(response);
    return acc;
  }, {});

  const scoresByCriteria = Object.entries(responsesByCriteria).map(
    ([criteriaName, data]) => {
      const { responses, type } = data;

      if (type === "NPS") {
        const npsResult = ratingService.calculateNPS(responses);
        return {
          criterion: criteriaName,
          scoreType: "NPS",
          score: npsResult.npsScore,
          promoters: npsResult.promoters,
          neutrals: npsResult.neutrals,
          detractors: npsResult.detractors,
          total: npsResult.total,
        };
      } else if (type === "CSAT" || type === "Star") {
        const csatResult = ratingService.calculateCSAT(responses);
        return {
          criterion: criteriaName,
          scoreType: "CSAT",
          score: csatResult.satisfactionRate,
          average: csatResult.averageScore,
          satisfied: csatResult.satisfied,
          neutral: csatResult.neutral,
          unsatisfied: csatResult.unsatisfied,
          total: csatResult.total,
        };
      } else {
        // Handle other types or return a default structure
        return {
          criterion: criteriaName,
          scoreType: type,
          total: responses.length,
          // Maybe calculate average for any rating type as a fallback
          average:
            responses.reduce((sum, r) => sum + r.ratingValue, 0) /
            responses.length,
        };
      }
    },
  );

  return scoresByCriteria;
};

module.exports = {
  getCriteriaScores,
};
