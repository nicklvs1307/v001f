const ratingService = {
  /**
   * Classifica uma única resposta de avaliação NPS.
   * @param {number} rating - A nota da avaliação (0-10).
   * @returns {string|null} - Retorna 'promoter', 'neutral', 'detractor' ou null.
   */
  classifyNPS(rating) {
    if (rating === null || rating === undefined) {
      return null;
    }
    if (rating >= 9) return "promoter";
    if (rating >= 7) return "neutral";
    return "detractor";
  },

  /**
   * Classifica uma única resposta de avaliação CSAT.
   * @param {number} rating - A nota da avaliação (1-5).
   * @returns {string|null} - Retorna 'satisfied', 'neutral', 'unsatisfied' ou null.
   */
  classifyCSAT(rating) {
    if (rating === null || rating === undefined) {
      return null;
    }
    if (rating >= 4) return "satisfied"; // Notas 4 e 5 são consideradas satisfeitos
    if (rating === 3) return "neutral";
    return "unsatisfied"; // Notas 1 e 2 são consideradas insatisfeitos
  },

  /**
   * Calcula o NPS a partir de uma lista de respostas.
   * Ignora respostas que não são de perguntas do tipo 'rating_0_10'.
   * @param {Array<Object>} responses - Uma lista de objetos de resposta { ratingValue: number, pergunta: { type: string } }.
   * @returns {Object} - Um objeto contendo o score de NPS e as contagens.
   */
  calculateNPS(responses) {
    let promoters = 0;
    let neutrals = 0;
    let detractors = 0;
    let total = 0;

    responses.forEach((response) => {
      const rating = response.ratingValue;
      const questionType = response.pergunta ? response.pergunta.type : null;

      if (questionType !== "rating_0_10") {
        return; // Ignora silenciosamente para não quebrar a aplicação durante a transição
      }

      const classification = this.classifyNPS(rating);

      if (classification) {
        total++;
        if (classification === "promoter") promoters++;
        else if (classification === "neutral") neutrals++;
        else if (classification === "detractor") detractors++;
      }
    });

    if (total === 0) {
      return {
        npsScore: 0,
        promoters: 0,
        neutrals: 0,
        detractors: 0,
        total: 0,
      };
    }

    const npsScore = (promoters / total) * 100 - (detractors / total) * 100;

    return {
      npsScore: parseFloat(npsScore.toFixed(1)),
      promoters,
      neutrals,
      detractors,
      total,
    };
  },

  /**
   * Calcula o CSAT a partir de uma lista de respostas.
   * Ignora respostas que não são de perguntas do tipo 'rating_1_5'.
   * @param {Array<Object>} responses - Uma lista de objetos de resposta { ratingValue: number, pergunta: { type: string } }.
   * @returns {Object} - Um objeto contendo as pontuações de CSAT e as contagens.
   */
  calculateCSAT(responses) {
    let satisfied = 0;
    let neutral = 0;
    let unsatisfied = 0;
    let total = 0;
    let sumOfRatings = 0;

    responses.forEach((response) => {
      const rating = response.ratingValue;
      const questionType = response.pergunta ? response.pergunta.type : null;

      if (questionType !== "rating_1_5") {
        return; // Ignora silenciosamente
      }

      const classification = this.classifyCSAT(rating);

      if (classification) {
        total++;
        sumOfRatings += rating;
        if (classification === "satisfied") satisfied++;
        else if (classification === "neutral") neutral++;
        else if (classification === "unsatisfied") unsatisfied++;
      }
    });

    if (total === 0) {
      return {
        satisfactionRate: 0,
        averageScore: 0,
        satisfied: 0,
        neutral: 0,
        unsatisfied: 0,
        total: 0,
      };
    }

    // CSAT é medido como o percentual de clientes "satisfeitos" (notas 4 e 5)
    const satisfactionRate = ((satisfied + neutral) / total) * 100;
    const averageScore = sumOfRatings / total;

    return {
      satisfactionRate: parseFloat(satisfactionRate.toFixed(1)),
      averageScore: parseFloat(averageScore.toFixed(2)),
      satisfied,
      neutral,
      unsatisfied,
      total,
    };
  },

  /**
   * Calculates NPS score from pre-aggregated counts.
   * @param {Object} counts - An object containing { promoters, neutrals, detractors, total }.
   * @returns {number} The final NPS score.
   */
  calculateNPSFromCounts(counts) {
    const { promoters, detractors, total } = counts;
    if (total === 0) {
      return 0;
    }
    const npsScore = (promoters / total) * 100 - (detractors / total) * 100;
    return parseFloat(npsScore.toFixed(1));
  },

  /**
   * Calculates CSAT scores from pre-aggregated counts.
   * @param {Object} counts - An object containing { satisfied, neutral, sum, count }.
   * @returns {Object} An object with { averageScore, satisfactionRate }.
   */
  calculateCSATFromCounts(counts) {
    const { satisfied, neutral, sum, count } = counts;
    if (count === 0) {
      return { averageScore: 0, satisfactionRate: 0 };
    }
    const averageScore = sum / count;
    // Note: This logic matches the existing calculateCSAT. Review if it should only be 'satisfied'.
    const satisfactionRate = ((satisfied + neutral) / count) * 100;
    return {
      averageScore: parseFloat(averageScore.toFixed(2)),
      satisfactionRate: parseFloat(satisfactionRate.toFixed(1)),
    };
  },
};

module.exports = ratingService;
