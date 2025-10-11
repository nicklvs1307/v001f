
const npsService = {
  /**
   * Classifica uma única resposta de avaliação em Promotor, Neutro ou Detrator.
   * @param {number} rating - A nota da avaliação.
   * @param {string} questionType - O tipo de pergunta (ex: 'rating_0_10', 'rating_1_5').
   * @returns {string|null} - Retorna 'promoter', 'neutral', 'detractor' ou null se o tipo for inválido.
   */
  classifyRating(rating, questionType) {
    if (rating === null || rating === undefined) {
      return null;
    }

    if (questionType === 'rating_0_10') {
      if (rating >= 9) return 'promoter';
      if (rating >= 7) return 'neutral';
      return 'detractor';
    }

    if (questionType === 'rating_1_5') {
      if (rating === 5) return 'promoter';
      if (rating === 4) return 'neutral';
      return 'detractor';
    }

    return null;
  },

  /**
   * Calcula o NPS a partir de uma lista de respostas.
   * As respostas devem ter a estrutura: { ratingValue: number, pergunta: { type: string } }
   * @param {Array<Object>} responses - Uma lista de objetos de resposta.
   * @returns {Object} - Um objeto contendo o score de NPS e as contagens.
   */
  calculateNPS(responses) {
    let promoters = 0;
    let neutrals = 0;
    let detractors = 0;
    let total = 0;

    responses.forEach(response => {
      const rating = response.ratingValue;
      const questionType = response.pergunta ? response.pergunta.type : null;

      const classification = this.classifyRating(rating, questionType);

      if (classification) {
        total++;
        if (classification === 'promoter') promoters++;
        else if (classification === 'neutral') neutrals++;
        else if (classification === 'detractor') detractors++;
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

    const npsScore = ((promoters / total) * 100) - ((detractors / total) * 100);

    return {
      npsScore: parseFloat(npsScore.toFixed(1)),
      promoters,
      neutrals,
      detractors,
      total,
    };
  },
};

module.exports = npsService;
