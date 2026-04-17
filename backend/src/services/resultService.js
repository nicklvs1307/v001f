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
      } else if (question.type === "multiple_choice" || question.type === "checkbox") {
        const optionsCount = {};
        if (question.options && Array.isArray(question.options)) {
          question.options.forEach((opt) => (optionsCount[opt] = 0));
        }
        questionResponses.forEach((r) => {
          if (r.selectedOption) {
            try {
              const selectedOptions = JSON.parse(r.selectedOption);
              if (Array.isArray(selectedOptions)) {
                selectedOptions.forEach((opt) => {
                  if (optionsCount.hasOwnProperty(opt)) {
                    optionsCount[opt]++;
                  }
                });
              } else if (optionsCount.hasOwnProperty(r.selectedOption)) {
                optionsCount[r.selectedOption]++;
              }
            } catch (e) {
              if (optionsCount.hasOwnProperty(r.selectedOption)) {
                optionsCount[r.selectedOption]++;
              }
            }
          }
        });
        result.optionsCount = optionsCount;
      } else if (question.type === "yes_no") {
        const yesNoCount = { Sim: 0, Não: 0 };
        questionResponses.forEach((r) => {
          if (r.selectedOption) {
            const normalizedValue = String(r.selectedOption).toLowerCase().trim();
            if (normalizedValue === "sim" || normalizedValue === "yes") {
              yesNoCount.Sim++;
            } else if (normalizedValue === "não" || normalizedValue === "nao" || normalizedValue === "no") {
              yesNoCount.Não++;
            }
          }
        });
        result.yesNoCount = yesNoCount;
      }
      aggregatedResults.questionsResults.push(result);
    }

    return aggregatedResults;
  }
}

module.exports = new ResultService(resultRepository);
