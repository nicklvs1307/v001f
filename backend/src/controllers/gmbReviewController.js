const asyncHandler = require("express-async-handler");
const { fromZonedTime } = require('date-fns-tz');
const gmbReviewRepository = require("../repositories/gmbReviewRepository");
const ApiError = require("../errors/ApiError");

const gmbReviewController = {
  // @desc    Obtém todas as avaliações GMB para um tenant
  // @route   GET /api/gmb/reviews
  // @access  Private (Admin, Super Admin)
  getAllReviews: asyncHandler(async (req, res) => {
    const requestingUser = req.user;
    const reviews = await gmbReviewRepository.getAllReviewsByTenant(requestingUser.tenantId);
    res.status(200).json(reviews);
  }),

  // @desc    Responde a uma avaliação GMB
  // @route   PUT /api/gmb/reviews/:id/reply
  // @access  Private (Admin, Super Admin)
  replyToReview: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { replyComment } = req.body;
    const requestingUser = req.user;

    if (!replyComment) {
      throw new ApiError(400, "Comentário de resposta é obrigatório.");
    }

    const updatedRows = await gmbReviewRepository.updateReview(
      id,
      requestingUser.tenantId,
      { replyComment, repliedAt: fromZonedTime(new Date(), 'America/Sao_Paulo') }
    );

    if (updatedRows === 0) {
      throw new ApiError(404, "Avaliação não encontrada ou não pertence ao seu tenant.");
    }

    res.status(200).json({ message: "Resposta enviada com sucesso!" });
  }),

  // @desc    Sincroniza avaliações GMB (simulado)
  // @route   POST /api/gmb/reviews/sync
  // @access  Private (Admin, Super Admin)
  syncReviews: asyncHandler(async (req, res) => {
    // Esta é uma simulação. Em um cenário real, você faria uma chamada à API do Google My Business
    // para buscar as avaliações e salvá-las no banco de dados.
    console.log("Sincronizando avaliações GMB para o tenant:", req.user.tenantId);
    // Exemplo de como você adicionaria uma avaliação simulada
    // await gmbReviewRepository.createReview({ 
    //   tenantId: req.user.tenantId,
    //   gmbReviewId: `gmb_review_${Date.now()}`,
    //   reviewerName: "Cliente Teste",
    //   starRating: 5,
    //   comment: "Ótimo atendimento!",
    //   reviewUrl: "http://example.com/review",
    // });

    res.status(200).json({ message: "Sincronização de avaliações GMB iniciada (simulado)." });
  }),
};

module.exports = gmbReviewController;
