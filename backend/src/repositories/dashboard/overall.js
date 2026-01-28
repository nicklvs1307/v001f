const models = require("../../../models");
// const { subDays } = require("date-fns"); // No longer needed here
const sequelize = require("sequelize");
const { Op } = sequelize;
const { now, getUtcDateRange } = require("../../utils/dateUtils");
const { buildWhereClause } = require("../../utils/filterUtils");
const {
  calculateAgeDistribution,
  calculateGenderDistribution,
} = require("../../utils/demographicsUtils");
const ratingService = require("../../services/ratingService");
const { getResponseChart } = require("./charts");

const getOverallResults = async function (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const whereClause = buildWhereClause({ tenantId, surveyId, dateRange });

  const allResponses = await models.Resposta.findAll({
    where: { ...whereClause, ratingValue: { [Op.ne]: null } },
    include: [
      {
        model: models.Pergunta,
        as: "pergunta",
        attributes: ["id", "type", "criterioId"],
        include: [
          {
            model: models.Criterio,
            as: "criterio",
            attributes: ["name", "type"],
          },
        ],
      },
      {
        model: models.Client,
        as: "client",
        attributes: ["birthDate", "gender"],
      },
      {
        model: models.Atendente,
        as: "atendente",
        attributes: ["id", "name"],
      },
    ],
  });

  // 1. Calcular Scores Gerais (NPS e CSAT)
  const npsResponses = allResponses.filter(
    (r) => r.pergunta && r.pergunta.type === "rating_0_10",
  );
  const csatResponses = allResponses.filter(
    (r) => r.pergunta && r.pergunta.type === "rating_1_5",
  );

  const overallNpsResult = ratingService.calculateNPS(npsResponses);
  const overallCsatResult = ratingService.calculateCSAT(csatResponses);

  // 2. Calcular Scores por Critério (reutilizando a lógica de getCriteriaScores)
  const responsesByCriteria = allResponses.reduce((acc, response) => {
    if (
      response.pergunta &&
      response.pergunta.criterio &&
      response.pergunta.type.startsWith("rating")
    ) {
      const criteriaName = response.pergunta.criterio.name;
      const questionType = response.pergunta.type.startsWith("rating_0_10")
        ? "NPS"
        : "CSAT"; // Determine type from question

      const key = `${criteriaName}|${questionType}`;

      if (!acc[key]) {
        acc[key] = {
          criterion: criteriaName,
          responses: [],
          type: questionType,
        };
      }
      acc[key].responses.push(response);
    }
    return acc;
  }, {});

  const scoresByCriteria = Object.values(responsesByCriteria)
    .map((data) => {
      const { responses, type, criterion } = data;
      if (type === "NPS") {
        const npsResult = ratingService.calculateNPS(responses);
        return { criterion, scoreType: "NPS", ...npsResult };
      } else if (type === "CSAT") {
        const csatResult = ratingService.calculateCSAT(responses);
        return { criterion, scoreType: "CSAT", ...csatResult };
      }
      return null;
    })
    .filter(Boolean);

  // 3. Preparar dados para Radar Chart (Média de avaliação por critério)
  const radarDataMap = new Map();
  allResponses.forEach((response) => {
    const pergunta = response.pergunta;
    if (pergunta && pergunta.type.startsWith("rating")) {
      const key = pergunta.criterio ? pergunta.criterio.name : "Outros";
      if (!radarDataMap.has(key)) {
        radarDataMap.set(key, { sum: 0, count: 0 });
      }
      const dataStats = radarDataMap.get(key);
      if (response.ratingValue !== null) {
        dataStats.sum += response.ratingValue;
        dataStats.count++;
      }
    }
  });
  const radarChartData = Array.from(radarDataMap.entries()).map(
    ([name, stats]) => ({
      name: name,
      averageRating:
        stats.count > 0 ? parseFloat((stats.sum / stats.count).toFixed(2)) : 0,
    }),
  );

  // 4. Processar dados demográficos
  const uniqueClients = [
    ...new Map(allResponses.map((r) => [r.client?.id, r.client])).values(),
  ].filter(Boolean);
  const demographics = {
    ageDistribution: calculateAgeDistribution(uniqueClients),
    genderDistribution: calculateGenderDistribution(uniqueClients),
  };

  // 5. Top e Bottom 5 Atendentes por performance
  const responsesByAttendant = allResponses.reduce((acc, response) => {
    if (response.atendente && response.atendente.id) {
      const attendantId = response.atendente.id;
      if (!acc[attendantId]) {
        acc[attendantId] = {
          id: attendantId,
          name: response.atendente.name,
          responses: [],
        };
      }
      acc[attendantId].responses.push(response);
    }
    return acc;
  }, {});

  const attendantIds = Object.keys(responsesByAttendant);
  const allMetas = await models.AtendenteMeta.findAll({
    where: {
      atendenteId: { [Op.in]: attendantIds },
      tenantId: tenantId,
    },
  });
  const metasMap = new Map(allMetas.map((meta) => [meta.atendenteId, meta]));

  const attendantsArray = Object.values(responsesByAttendant).map(
    (attendant) => {
      const npsResult = ratingService.calculateNPS(attendant.responses);
      const csatResult = ratingService.calculateCSAT(attendant.responses);
      const meta = metasMap.get(attendant.id) || {};
      return {
        name: attendant.name,
        responses: attendant.responses.length,
        nps: npsResult,
        csat: csatResult,
        meta,
      };
    },
  );

  const sortedAttendants = attendantsArray.sort(
    (a, b) =>
      (b.nps.npsScore || 0) - (a.nps.npsScore || 0) ||
      (b.csat.averageScore || 0) - (a.csat.averageScore || 0),
  );

  const topAttendants = sortedAttendants.slice(0, 5);
  const bottomAttendants = sortedAttendants.slice(-5).reverse();

  // 6. Respostas ao longo do tempo
  const responseChartData = await getResponseChart(
    tenantId,
    startOfDayUtc, // Pass the Date object
    endOfDayUtc, // Pass the Date object
    surveyId,
  );

  return {
    overallNPS: overallNpsResult,
    overallCSAT: overallCsatResult,
    scoresByCriteria,
    radarChartData,
    demographics,
    topAttendants,
    bottomAttendants,
    responseChartData,
  };
};

module.exports = {
  getOverallResults,
};
