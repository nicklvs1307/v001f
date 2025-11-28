const { Resposta, Pergunta, Criterio } = require("../../../models");
const { Op } = require("sequelize");
const { getUtcDateRange } = require("../../utils/dateUtils");
const { buildWhereClause } = require("../../utils/filterUtils");
const ratingService = require("../../services/ratingService");

const getCriteriaScores = async (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const responseWhere = buildWhereClause({ tenantId, surveyId, dateRange });
  responseWhere.ratingValue = { [Op.ne]: null };

  const criterios = await Criterio.findAll({
    where: { tenantId },
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
            required: false, // LEFT JOIN para incluir critérios mesmo sem respostas
            attributes: ["ratingValue", "perguntaId"],
          },
        ],
      },
    ],
    order: [["name", "ASC"]],
  });

  const scoresByCriteria = criterios.map((criterio) => {
    const allResponses = criterio.perguntas.flatMap((p) => p.respostas);
    const type = criterio.type;

    if (type === "NPS") {
      const npsResult = ratingService.calculateNPS(
        // Adiciona o tipo da pergunta para o ratingService funcionar corretamente
        allResponses.map(r => ({...r.get({ plain: true }), pergunta: { type: 'rating_0_10' }}))
      );
      return {
        criterion: criterio.name,
        scoreType: "NPS",
        score: npsResult.npsScore,
        promoters: npsResult.promoters,
        neutrals: npsResult.neutrals,
        detractors: npsResult.detractors,
        total: npsResult.total,
      };
    } else if (type === "CSAT" || type === "Star") {
      const csatResult = ratingService.calculateCSAT(
        // Adiciona o tipo da pergunta para o ratingService funcionar corretamente
        allResponses.map(r => ({...r.get({ plain: true }), pergunta: { type: 'rating_1_5' }}))
      );
      return {
        criterion: criterio.name,
        scoreType: "CSAT",
        score: csatResult.satisfactionRate,
        average: csatResult.averageScore,
        satisfied: csatResult.satisfied,
        neutral: csatResult.neutral,
        unsatisfied: csatResult.unsatisfied,
        total: csatResult.total,
      };
    } else {
      return {
        criterion: criterio.name,
        scoreType: type,
        score: 0,
        total: allResponses.length,
      };
    }
  });

  return scoresByCriteria;
};

module.exports = {
  getCriteriaScores,
};
