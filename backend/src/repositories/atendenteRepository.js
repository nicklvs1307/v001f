const { Atendente, Tenant, AtendentePremiacao, Resposta, Pergunta } = require("../../models");
const { Op, fn, col, literal, Sequelize } = require("sequelize");
const { startOfMonth } = require("date-fns");

const createAtendente = async (tenantId, name, status, code) => {
  return Atendente.create({ tenantId, name, status, code });
};

const getAllAtendentes = async (tenantId) => {
  const whereClause = tenantId ? { tenantId } : {};
  return Atendente.findAll({
    where: whereClause,
    order: [["name", "ASC"]],
  });
};

const getAtendenteById = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, tenantId } : { id };
  return Atendente.findOne({ where: whereClause });
};

const updateAtendente = async (id, tenantId, name, status) => {
  const [updatedRows, [updatedAtendente]] = await Atendente.update(
    { name, status },
    { where: { id, tenantId }, returning: true },
  );
  return updatedAtendente;
};

const deleteAtendente = async (id, tenantId) => {
  return Atendente.destroy({ where: { id, tenantId } });
};

const findPremiacoesByAtendenteId = async (atendenteId, tenantId) => {
  return AtendentePremiacao.findAll({
    where: { atendenteId, tenantId },
    order: [["dateAwarded", "DESC"]],
  });
};

const findAtendentePerformanceById = async (atendenteId, tenantId) => {
    const now = new Date();
    const beginningOfMonth = startOfMonth(now);

    const whereClause = {
        tenantId,
        atendenteId,
        createdAt: { [Op.gte]: beginningOfMonth },
    };

    // Calcular NPS
    const npsData = await Resposta.findOne({
        where: {
            ...whereClause,
            ratingValue: { [Op.ne]: null },
        },
        include: [{
            model: Pergunta,
            as: 'pergunta',
            where: { type: 'rating_0_10' },
            attributes: []
        }],
        attributes: [
            [fn('SUM', literal('CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END')), 'promoters'],
            [fn('SUM', literal('CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END')), 'detractors'],
            [fn('COUNT', col('Resposta.id')), 'total'],
        ],
        raw: true,
    });

    let npsScore = 0;
    const total = parseInt(npsData.total, 10) || 0;
    if (total > 0) {
        const promoters = parseInt(npsData.promoters, 10) || 0;
        const detractors = parseInt(npsData.detractors, 10) || 0;
        npsScore = ((promoters - detractors) / total) * 100;
    }

    // Contar pesquisas únicas
    const surveyCount = await Resposta.count({
        where: whereClause,
        distinct: true,
        col: 'respondentSessionId',
    });

    // Contar cadastros (registrations) vinculados a este atendente no período
    // 1. Pegar sessionIds do atendente
    const sessions = await Resposta.findAll({
        where: {
            ...whereClause,
            respondentSessionId: { [Op.ne]: null }
        },
        attributes: [[fn('DISTINCT', col('respondentSessionId')), 'sessionId']],
        raw: true
    });
    
    const sessionIds = sessions.map(s => s.sessionId);
    let registrationCount = 0;

    if (sessionIds.length > 0) {
        registrationCount = await require("../../models").Client.count({ // Lazy load model to avoid circular dependency issues if any
            where: {
                tenantId,
                respondentSessionId: { [Op.in]: sessionIds },
                createdAt: { [Op.gte]: beginningOfMonth } // Mesmo filtro de data das respostas
            }
        });
    }

    return {
        currentNPS: npsScore,
        surveysResponded: surveyCount,
        registrations: registrationCount,
    };
};

module.exports = {
  createAtendente,
  getAllAtendentes,
  getAtendenteById,
  updateAtendente,
  deleteAtendente,
  findPremiacoesByAtendenteId,
  findAtendentePerformanceById,
};
