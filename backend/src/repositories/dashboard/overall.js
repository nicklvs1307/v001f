const models = require("../../../models");
// const { subDays } = require("date-fns"); // No longer needed here
const sequelize = require("sequelize");
const { Op } = sequelize;
const {
  // convertToTimeZone, // No longer needed here
  convertFromTimeZone,
} = require("../../utils/dateUtils");
const ratingService = require("../../services/ratingService");
const { getResponseChart } = require("./charts");

const getOverallResults = async function (
  tenantId = null,
  startOfDayUtc = null, // Changed parameter name
  endOfDayUtc = null,   // Changed parameter name
  surveyId = null,
) {
  const whereClause = tenantId ? { tenantId } : {};
  if (surveyId) {
    whereClause.pesquisaId = surveyId;
  }
  // Use the already processed UTC Date objects
  if (startOfDayUtc && endOfDayUtc) {
    whereClause.createdAt = { [Op.gte]: startOfDayUtc, [Op.lte]: endOfDayUtc };
  }

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
  const demographics = {};
  const birthDates = [];
  const genders = [];
  allResponses.forEach((response) => {
    if (response.client) {
      if (response.client.birthDate)
        birthDates.push(new Date(response.client.birthDate));
      if (response.client.gender) genders.push(response.client.gender);
    }
  });

  if (birthDates.length > 0) {
    const ageGroups = {
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55+": 0,
    };
    const currentYear = convertFromTimeZone(new Date()).getFullYear();
    birthDates.forEach((dob) => {
      const age = currentYear - dob.getFullYear();
      if (age >= 18 && age <= 24) ageGroups["18-24"]++;
      else if (age >= 25 && age <= 34) ageGroups["25-34"]++;
      else if (age >= 35 && age <= 44) ageGroups["35-44"]++;
      else if (age >= 45 && age <= 54) ageGroups["45-54"]++;
      else if (age >= 55) ageGroups["55+"]++;
    });
    demographics.ageDistribution = ageGroups;
  }

  if (genders.length > 0) {
    const genderDistribution = { masculino: 0, feminino: 0, outro: 0 };
    genders.forEach((gender) => {
      const g = gender.toLowerCase();
      if (genderDistribution.hasOwnProperty(g)) genderDistribution[g]++;
      else genderDistribution["outro"]++;
    });
    demographics.genderDistribution = genderDistribution;
  }

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

  const attendantsArray = await Promise.all(
    Object.values(responsesByAttendant).map(async (attendant) => {
      const npsResult = ratingService.calculateNPS(attendant.responses);
      const csatResult = ratingService.calculateCSAT(attendant.responses);
      const meta = await models.AtendenteMeta.findOne({
        where: { atendenteId: attendant.id, tenantId: tenantId },
      });
      return {
        name: attendant.name,
        responses: attendant.responses.length,
        nps: npsResult,
        csat: csatResult,
        meta: meta || {},
      };
    }),
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
    endOfDayUtc,   // Pass the Date object
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
