const { GmbReview, Tenant } = require("../../models");

const gmbReviewRepository = {
  // Cria uma nova avaliação GMB
  createReview: async (reviewData) => {
    return GmbReview.create(reviewData);
  },

  // Obtém todas as avaliações GMB para um tenant
  getAllReviewsByTenant: async (tenantId) => {
    return GmbReview.findAll({
      where: { tenantId },
      order: [['createdAt', 'DESC']],
    });
  },

  // Obtém uma avaliação GMB específica por ID
  getReviewById: async (id, tenantId) => {
    return GmbReview.findOne({
      where: { id, tenantId },
    });
  },

  // Atualiza uma avaliação GMB (ex: adiciona resposta)
  updateReview: async (id, tenantId, updateData) => {
    const [updatedRows] = await GmbReview.update(updateData, {
      where: { id, tenantId },
    });
    return updatedRows;
  },

  // Deleta uma avaliação GMB
  deleteReview: async (id, tenantId) => {
    return GmbReview.destroy({
      where: { id, tenantId },
    });
  },
};

module.exports = gmbReviewRepository;
