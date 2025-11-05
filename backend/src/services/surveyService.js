const surveyRepository = require('../repositories/surveyRepository');
const resultRepository = require('../repositories/resultRepository');
const ApiError = require('../errors/ApiError');
const ratingService = require('./ratingService'); // Importar o ratingService

const createSurvey = async (surveyData, requestingUser) => {
  const { recompensaId, roletaId } = surveyData;

  if (recompensaId && roletaId) {
    throw new ApiError(400, 'Uma pesquisa não pode ter uma recompensa e uma roleta ao mesmo tempo.');
  }

  const targetTenantId =
    requestingUser.role === "Super Admin" && surveyData.tenantId
      ? surveyData.tenantId
      : requestingUser.tenantId;

  if (!targetTenantId) {
    throw new ApiError(400, "Tenant ID é obrigatório para criar uma pesquisa.");
  }

  const survey = await surveyRepository.createSurvey({
    ...surveyData,
    tenantId: targetTenantId,
    creatorId: requestingUser.id,
  });

  return survey;
};

const updateSurvey = async (surveyId, surveyData, requestingUser) => {
  const { recompensaId, roletaId } = surveyData;

  if (recompensaId && roletaId) {
    throw new ApiError(400, 'Uma pesquisa não pode ter uma recompensa e uma roleta ao mesmo tempo.');
  }

  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

  const existingSurvey = await surveyRepository.getSurveyTenantIdAndCreatorId(surveyId, tenantId);
  if (!existingSurvey) {
    throw new ApiError(404, "Pesquisa não encontrada.");
  }

  if (
    requestingUser.role !== "Super Admin" &&
    existingSurvey.tenantId !== requestingUser.tenantId
  ) {
    throw new ApiError(
      403,
      "Você não tem permissão para atualizar esta pesquisa.",
    );
  }

  const updatedSurvey = await surveyRepository.updateSurvey(surveyId, surveyData, tenantId);

  return updatedSurvey;
};

const deleteSurvey = async (surveyId, requestingUser) => {
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

  const existingSurvey = await surveyRepository.getSurveyTenantIdAndCreatorId(surveyId, tenantId);
  if (!existingSurvey) {
    throw new ApiError(404, "Pesquisa não encontrada para deleção.");
  }

  if (
    requestingUser.role !== "Super Admin" &&
    (existingSurvey.tenantId !== requestingUser.tenantId ||
      existingSurvey.creatorId !== requestingUser.id)
  ) {
    throw new ApiError(
      403,
      "Você não tem permissão para deletar esta pesquisa.",
    );
  }

  const deletedRowCount = await surveyRepository.deleteSurvey(surveyId, tenantId);

  if (deletedRowCount === 0) {
    throw new ApiError(404, "Pesquisa não encontrada para deleção.");
  }

  return deletedRowCount;
};


const getSurveysList = async (tenantId = null, status = 'all') => {
  const surveys = await surveyRepository.findAllForList(tenantId, status);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return surveys.map(survey => {
    const progress = survey.expectedRespondents > 0 ? (survey.currentRespondents / survey.expectedRespondents) * 100 : 0;

    let statusText = survey.status;
    let statusColor = '#6c757d'; // default secondary

    if (survey.status === 'active') {
      statusText = 'Ativa';
      statusColor = '#1cc88a'; // success
    } else if (survey.status === 'pending') {
      statusText = 'Pendente';
      statusColor = '#f6c23e'; // warning
    } else if (survey.status === 'draft') {
      statusText = 'Rascunho';
      statusColor = '#36b9cc'; // info
    } else if (survey.status === 'inactive') {
      statusText = 'Inativa';
      statusColor = '#e74a3b'; // danger
    }

    return {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      status: statusText,
      statusColor: statusColor,
      progress: parseFloat(progress.toFixed(2)),
      respondents: survey.currentRespondents,
      totalRespondents: survey.expectedRespondents || 0,
      dueDate: survey.dueDate || null,
      isOpen: survey.isOpen,
      askForAttendant: survey.askForAttendant,
      perguntas: survey.perguntas.map(p => ({ ...p })),
      publicUrl: `${frontendUrl}/pesquisa/${survey.tenantId}/${survey.id}`,
    };
  });
};

const getSurveyResultsById = async (surveyId, tenantId = null) => {
  const rawResults = await surveyRepository.findResultsById(surveyId, tenantId);

  if (!rawResults || !rawResults.survey) {
    return null;
  }

  const { survey, totalResponsesCount } = rawResults;

  // Coleta todas as respostas de avaliação de todas as perguntas
  const allRatingResponses = survey.perguntas.reduce((acc, pergunta) => {
    if (pergunta.type.startsWith('rating')) {
      const responsesWithContext = pergunta.respostas.map(r => ({ ...r, pergunta: { type: pergunta.type, criterio: pergunta.criterio } }));
      acc.push(...responsesWithContext);
    }
    return acc;
  }, []);

  const npsResponses = allRatingResponses.filter(r => r.pergunta.type === 'rating_0_10');
  const csatResponses = allRatingResponses.filter(r => r.pergunta.type === 'rating_1_5');

  // Calcula os scores gerais usando o serviço centralizado
  const overallNpsResult = ratingService.calculateNPS(npsResponses);
  const overallCsatResult = ratingService.calculateCSAT(csatResponses);

  const formattedResults = {
    surveyTitle: survey.title,
    surveyDescription: survey.description,
    surveyCreatedAt: survey.createdAt,
    surveyTenantId: survey.tenantId,
    totalResponsesCount: totalResponsesCount,
    overallNPS: overallNpsResult,
    overallCSAT: overallCsatResult,
    questionsResults: survey.perguntas.map((pergunta) => {
      const questionData = {
        id: pergunta.id,
        text: pergunta.text,
        type: pergunta.type,
        options: pergunta.options,
        order: pergunta.order,
        criterio: pergunta.criterio ? pergunta.criterio.name : null,
        results: {},
      };

      if (pergunta.type === 'multiple_choice' || pergunta.type === 'checkbox') {
        const optionCounts = {};
        pergunta.options.forEach(option => (optionCounts[option] = 0));
        pergunta.respostas.forEach(resposta => {
          if (!resposta.selectedOption) return;
          try {
            let values = JSON.parse(resposta.selectedOption);
            if (!Array.isArray(values)) values = [values];
            values.forEach(val => {
              if (optionCounts.hasOwnProperty(val)) optionCounts[val]++;
            });
          } catch (e) {
            if (optionCounts.hasOwnProperty(resposta.selectedOption)) {
                optionCounts[resposta.selectedOption]++;
            }
          }
        });
        questionData.results = optionCounts;
      } else if (pergunta.type.startsWith('rating')) {
        const ratings = pergunta.respostas.map(r => parseInt(r.ratingValue)).filter(val => !isNaN(val));
        const sum = ratings.reduce((acc, val) => acc + val, 0);
        const avgRating = ratings.length > 0 ? (sum / ratings.length) : 0;

        questionData.results.averageRating = parseFloat(avgRating.toFixed(2));
        questionData.results.allRatings = ratings;
        questionData.results.count = ratings.length;

      } else {
        questionData.results.responses = pergunta.respostas.map(r => ({
          text: r.textValue,
          clientName: r.client ? r.client.name : 'Anônimo',
          clientEmail: r.client ? r.client.email : null,
          clientPhone: r.client ? r.client.phone : null,
          clientBirthDate: r.client ? r.client.birthDate : null,
        }));
      }

      return questionData;
    }),
    scoresByCriteria: [],
    radarChartData: [],
    demographics: {},
  };

  // Agrupa respostas por critério
  const responsesByCriteria = allRatingResponses.reduce((acc, response) => {
    if (response.pergunta && response.pergunta.criterio) {
      const criteriaName = response.pergunta.criterio.name;
      if (!acc[criteriaName]) {
        acc[criteriaName] = {
            responses: [],
            type: response.pergunta.criterio.type
        };
      }
      acc[criteriaName].responses.push(response);
    }
    return acc;
  }, {});

  // Calcula scores para cada critério
  formattedResults.scoresByCriteria = Object.entries(responsesByCriteria).map(([criteriaName, data]) => {
      const { responses, type } = data;
      if (type === 'NPS') {
          const npsResult = ratingService.calculateNPS(responses);
          return { criterion: criteriaName, scoreType: 'NPS', ...npsResult };
      } else if (type === 'CSAT' || type === 'Star') {
          const csatResult = ratingService.calculateCSAT(responses);
          return { criterion: criteriaName, scoreType: 'CSAT', ...csatResult };
      }
      return null;
  }).filter(Boolean);

  const radarDataMap = new Map();
  survey.perguntas.forEach(pergunta => {
    if (pergunta.type.startsWith('rating')) {
      const key = pergunta.criterio ? pergunta.criterio.name : pergunta.text;
      if (!radarDataMap.has(key)) {
        radarDataMap.set(key, { sum: 0, count: 0 });
      }
      const dataStats = radarDataMap.get(key);

      pergunta.respostas.forEach(resposta => {
        const rating = resposta.ratingValue;
        if (rating !== null) {
          dataStats.sum += rating;
          dataStats.count++;
        }
      });
    }
  });

  radarDataMap.forEach((stats, name) => {
    const average = stats.count > 0 ? (stats.sum / stats.count) : 0;
    formattedResults.radarChartData.push({
      name: name,
      averageRating: parseFloat(average.toFixed(2)),
    });
  });

  const birthDates = [];
  survey.perguntas.forEach(pergunta => {
    pergunta.respostas.forEach(resposta => {
      if (resposta.client && resposta.client.birthDate) {
        birthDates.push(new Date(resposta.client.birthDate));
      }
    });
  });

  if (birthDates.length > 0) {
    const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    const currentYear = new Date().getFullYear();

    birthDates.forEach(dob => {
      const age = currentYear - dob.getFullYear();
      if (age >= 18 && age <= 24) ageGroups['18-24']++;
      else if (age >= 25 && age <= 34) ageGroups['25-34']++;
      else if (age >= 35 && age <= 44) ageGroups['35-44']++;
      else if (age >= 45 && age <= 54) ageGroups['45-54']++;
      else if (age >= 55) ageGroups['55+']++;
    });
    formattedResults.demographics.ageDistribution = ageGroups;
  }

  formattedResults.wordCloudData = await resultRepository.getWordCloudDataForSurvey(surveyId, tenantId);

  return formattedResults;
};

const getSurveyById = async (surveyId, requestingUser) => {
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;
  const survey = await surveyRepository.getSurveyById(surveyId, tenantId);

  if (!survey) {
    throw new ApiError(404, "Pesquisa não encontrada.");
  }

  // A verificação de tenant já é feita no repositório, mas uma dupla verificação aqui é boa para segurança
  if (
    requestingUser.role !== "Super Admin" &&
    survey.tenantId !== requestingUser.tenantId
  ) {
    throw new ApiError(403, "Você não tem permissão para ver esta pesquisa.");
  }

  return survey;
};

const getSurveyStats = async (requestingUser) => {
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;
  const stats = await surveyRepository.getSurveyStats(tenantId);
  return stats;
};

module.exports = {
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getSurveysList,
  getSurveyResultsById,
  getSurveyById,
  getSurveyStats,
};
