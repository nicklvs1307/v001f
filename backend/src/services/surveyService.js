const surveyRepository = require('../repositories/surveyRepository');
const ApiError = require('../errors/ApiError');

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
    creatorId: requestingUser.userId,
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
      existingSurvey.creatorId !== requestingUser.userId)
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

  // Calcular NPS Geral
  let promoters = 0;
  let neutrals = 0;
  let detractors = 0;
  let totalRatingResponses = 0;

  survey.perguntas.forEach(pergunta => {
    if (pergunta.type.startsWith('rating')) {
      pergunta.respostas.forEach(resposta => {
        const rating = resposta.ratingValue;
        if (rating !== null) {
          totalRatingResponses++;
          if (pergunta.type === 'rating_1_5') {
            if (rating === 5) promoters++;
            else if (rating === 4) neutrals++;
            else detractors++;
          } else if (pergunta.type === 'rating_0_10') {
            if (rating >= 9) promoters++;
            else if (rating >= 7 && rating <= 8) neutrals++;
            else detractors++;
          }
        }
      });
    }
  });

  let npsScore = 0;
  if (totalRatingResponses > 0) {
    npsScore = ((promoters / totalRatingResponses) * 100) - ((detractors / totalRatingResponses) * 100);
  }

  const formattedResults = {
    surveyTitle: survey.title,
    surveyDescription: survey.description,
    surveyCreatedAt: survey.createdAt,
    surveyTenantId: survey.tenantId,
    totalResponsesCount: totalResponsesCount,
    overallNPS: parseFloat(npsScore.toFixed(1)),
    npsPromoters: promoters,
    npsNeutrals: neutrals,
    npsDetractors: detractors,
    npsTotalResponses: totalRatingResponses,
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
          try {
            const values = JSON.parse(resposta.selectedOption);
            values.forEach(val => {
              if (optionCounts.hasOwnProperty(val)) {
                optionCounts[val]++;
              }
            });
          } catch (e) {
            console.error(`Erro ao fazer parse de selectedOption para resposta ${resposta.id}:`, e);
          }
        });
        questionData.results = optionCounts;
      } else if (pergunta.type.startsWith('rating')) {
        const ratings = pergunta.respostas.map(r => parseInt(r.ratingValue)).filter(val => !isNaN(val));
        const sum = ratings.reduce((acc, val) => acc + val, 0);
        const avgRating = ratings.length > 0 ? (sum / ratings.length) : 0;

        let qPromoters = 0;
        let qNeutrals = 0;
        let qDetractors = 0;

        pergunta.respostas.forEach(resposta => {
          const rating = resposta.ratingValue;
          if (rating !== null) {
            if (pergunta.type === 'rating_1_5') {
              if (rating === 5) qPromoters++;
              else if (rating === 4) qNeutrals++;
              else qDetractors++;
            } else if (pergunta.type === 'rating_0_10') {
              if (rating >= 9) qPromoters++;
              else if (rating >= 7 && rating <= 8) qNeutrals++;
              else qDetractors++;
            }
          }
        });

        let qNpsScore = 0;
        if (ratings.length > 0) {
          qNpsScore = ((qPromoters / ratings.length) * 100) - ((qDetractors / ratings.length) * 100);
        }

        questionData.results.average = parseFloat(avgRating.toFixed(2));
        questionData.results.count = ratings.length;
        questionData.results.nps = parseFloat(qNpsScore.toFixed(1));
        questionData.results.promoters = qPromoters;
        questionData.results.neutrals = qNeutrals;
        questionData.results.detractors = qDetractors;

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
    npsByCriterio: [],
    radarChartData: [],
    demographics: {},
  };

  const npsCriterioMap = new Map();
  survey.perguntas.forEach(pergunta => {
    if (pergunta.type.startsWith('rating') && pergunta.criterio) {
      const criterioName = pergunta.criterio.name;
      if (!npsCriterioMap.has(criterioName)) {
        npsCriterioMap.set(criterioName, { promoters: 0, neutrals: 0, detractors: 0, total: 0 });
      }
      const criterioStats = npsCriterioMap.get(criterioName);

      pergunta.respostas.forEach(resposta => {
        const rating = resposta.ratingValue;
        if (rating !== null) {
          criterioStats.total++;
          if (pergunta.type === 'rating_1_5') {
            if (rating === 5) criterioStats.promoters++;
            else if (rating === 4) criterioStats.neutrals++;
            else criterioStats.detractors++;
          } else if (pergunta.type === 'rating_0_10') {
            if (rating >= 9) criterioStats.promoters++;
            else if (rating >= 7 && rating <= 8) criterioStats.neutrals++;
            else criterioStats.detractors++;
          }
        }
      });
    }
  });

  npsCriterioMap.forEach((stats, criterioName) => {
    let nps = 0;
    if (stats.total > 0) {
      nps = ((stats.promoters / stats.total) * 100) - ((stats.detractors / stats.total) * 100);
    }
    formattedResults.npsByCriterio.push({
      criterio: criterioName,
      nps: parseFloat(nps.toFixed(1)),
      promoters: stats.promoters,
      neutrals: stats.neutrals,
      detractors: stats.detractors,
      total: stats.total,
    });
  });

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