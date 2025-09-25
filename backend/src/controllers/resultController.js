const asyncHandler = require("express-async-handler");
const resultRepository = require("../repositories/resultRepository");
const ApiError = require("../errors/ApiError");

// Função auxiliar para calcular NPS
const calculateNPS = (ratings) => {
  if (ratings.length === 0) return 0;

  let promoters = 0; // Notas 9-10
  let passives = 0; // Notas 7-8
  let detractors = 0; // Notas 0-6

  ratings.forEach((rating) => {
    if (rating >= 9) {
      promoters++;
    } else if (rating >= 7) {
      passives++;
    } else {
      detractors++;
    }
  });

  const totalResponses = ratings.length;
  const percentPromoters = (promoters / totalResponses) * 100;
  const percentDetractors = (detractors / totalResponses) * 100;

  return parseFloat((percentPromoters - percentDetractors).toFixed(2));
};

// @desc    Obter resultados agregados de uma pesquisa
// @route   GET /api/surveys/:id/results
// @access  Private (Super Admin, Admin, Survey Creator, Survey Viewer)
exports.getSurveyResults = asyncHandler(async (req, res) => {
  const { id } = req.params; // ID da pesquisa
  const requestingUser = req.user;
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

  // Super Admin pode ver qualquer resultado
  // Outros usuários só podem ver resultados de pesquisas do seu próprio tenant
  if (
    requestingUser.role !== "Super Admin" &&
    survey.tenantId !== requestingUser.tenantId
  ) {
    throw new ApiError(
      403,
      "Você não tem permissão para ver os resultados desta pesquisa.",
    );
  }

  // 2. Obter todas as perguntas da pesquisa
  const questions = await resultRepository.getQuestionsBySurveyId(id, tenantId);

  // 3. Obter todas as respostas para esta pesquisa
  const allResponses = await resultRepository.getResponsesBySurveyId(id, tenantId);

  // 4. Processar e agregar os resultados
  const aggregatedResults = {
    surveyId: survey.id,
    surveyTitle: survey.title,
    surveyDescription: survey.description,
    totalResponsesCount: 0,
    questionsResults: [],
  };

  const respondentSessionIds = new Set(
    allResponses.map((r) => r.respondentSessionId),
  );
  aggregatedResults.totalResponsesCount = respondentSessionIds.size;

  for (const question of questions) {
    const questionResponses = allResponses.filter(
      (r) => r.perguntaId === question.id,
    );
    const result = {
      questionId: question.id,
      questionText: question.text,
      questionType: question.type,
      responseCount: new Set(
        questionResponses.map((r) => r.respondentSessionId),
      ).size,
    };

    if (question.type === "free_text") {
      result.answers = questionResponses.map((r) => r.textValue);
    } else if (question.type.startsWith("rating")) {
      const ratings = questionResponses
        .map((r) => r.ratingValue)
        .filter((v) => v !== null);
      const sum = ratings.reduce((acc, curr) => acc + curr, 0);
      result.averageRating =
        ratings.length > 0 ? parseFloat((sum / ratings.length).toFixed(2)) : 0;
      result.allRatings = ratings;
      if (question.type === "rating_0_10") {
        result.nps = calculateNPS(ratings);
      }
    } else if (question.type === "multiple_choice") {
      const optionsCount = {};
      question.options.forEach((opt) => (optionsCount[opt] = 0));
      questionResponses.forEach((r) => {
        if (
          r.selectedOption &&
          optionsCount.hasOwnProperty(r.selectedOption)
        ) {
          optionsCount[r.selectedOption]++;
        }
      });
      result.optionsCount = optionsCount;
    }
    aggregatedResults.questionsResults.push(result);
  }

  res.status(200).json(aggregatedResults);
});
