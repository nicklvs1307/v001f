const {
  AtendentePremiacao,
  Atendente,
  Recompensa,
  AtendenteMeta,
  Tenant,
} = require("../../models");

const premiacaoRepository = {
  getAllPremiacoes: async (tenantId) => {
    return AtendentePremiacao.findAll({
      where: { tenantId },
      include: [
        { model: Atendente, as: "atendente", attributes: ["id", "name"] },
        { model: Recompensa, as: "recompensa", attributes: ["id", "name"] },
        {
          model: AtendenteMeta,
          as: "meta",
          attributes: ["id", "npsGoal", "responsesGoal", "registrationsGoal"],
        },
        { model: Tenant, as: "tenant", attributes: ["id", "name"] },
      ],
      order: [["dateAwarded", "DESC"]],
    });
  },
};

module.exports = premiacaoRepository;
