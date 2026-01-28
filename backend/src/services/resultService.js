const resultRepository = require("../repositories/resultRepository");
const ApiError = require("../errors/ApiError");

class ResultService {
  constructor(repository) {
    this.resultRepository = repository;
  }

  async aggregateSurveyResults(surveyId, tenantId) {
    // 1. Obter todas as perguntas da pesquisa
    const questions = await this.resultRepository.getQuestionsBySurveyId(
      surveyId,
      tenantId,
    );

    // 2. Obter todas as respostas para esta pesquisa
    const allResponses = await this.resultRepository.getResponsesBySurveyId(
      surveyId,
      tenantId,
    );

    // 3. Processar e agregar os resultados
    const aggregatedResults = {
      surveyId: surveyId,
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
          ratings.length > 0
            ? parseFloat((sum / ratings.length).toFixed(2))
            : 0;
        result.allRatings = ratings;
      } else if (question.type === "multiple_choice") {
        const optionsCount = {};
        if (question.options && Array.isArray(question.options)) {
          question.options.forEach((opt) => (optionsCount[opt] = 0));
        }
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

    return aggregatedResults;
  }
}

module.exports = new ResultService(resultRepository);
