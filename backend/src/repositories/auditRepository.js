const {
  Pesquisa,
  Pergunta,
  Resposta,
  Client,
  Cupom,
  Recompensa,
  sequelize,
} = require("../../models");
const { Op } = require("sequelize");

class AuditRepository {
  /**
   * Lista todas as participações (sessões de resposta) de forma paginada
   */
  async findAllAuditSurveys(tenantId, { page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;

    // Primeiro, vamos buscar os respondentSessionId únicos para paginação
    // Precisamos de uma query complexa porque queremos agrupar por sessão
    // mas também queremos filtrar pelo nome do cliente ou telefone
    
    const sessionsQuery = `
      SELECT 
        r."respondentSessionId",
        MAX(r."createdAt") as "participationDate",
        p.title as "surveyTitle",
        c.name as "clientName",
        c.phone as "clientPhone",
        c.id as "clientId",
        cup.status as "couponStatus",
        cup.codigo as "couponCode",
        cup.id as "couponId"
      FROM "respostas" r
      JOIN "pesquisas" p ON r."pesquisaId" = p.id
      LEFT JOIN "clients" c ON r."respondentSessionId" = c."respondentSessionId"
      LEFT JOIN "cupons" cup ON cup."pesquisaId" = r."pesquisaId" AND cup."clienteId" = c.id
      WHERE r."tenantId" = :tenantId
      ${search ? `AND (c.name ILIKE :search OR c.phone ILIKE :search OR p.title ILIKE :search)` : ''}
      GROUP BY r."respondentSessionId", p.title, c.name, c.phone, c.id, cup.status, cup.codigo, cup.id
      ORDER BY "participationDate" DESC
      LIMIT :limit OFFSET :offset
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT r."respondentSessionId") as total
      FROM "respostas" r
      LEFT JOIN "clients" c ON r."respondentSessionId" = c."respondentSessionId"
      LEFT JOIN "pesquisas" p ON r."pesquisaId" = p.id
      WHERE r."tenantId" = :tenantId
      ${search ? `AND (c.name ILIKE :search OR c.phone ILIKE :search OR p.title ILIKE :search)` : ''}
    `;

    const participations = await sequelize.query(sessionsQuery, {
      replacements: { tenantId, limit, offset, search: `%${search}%` },
      type: sequelize.QueryTypes.SELECT
    });

    const totalCountResult = await sequelize.query(countQuery, {
      replacements: { tenantId, search: `%${search}%` },
      type: sequelize.QueryTypes.SELECT
    });

    const total = parseInt(totalCountResult[0].total, 10);

    return {
      participations,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtém os detalhes completos de uma participação específica
   */
  async getAuditSurveyDetails(respondentSessionId, tenantId) {
    // 1. Buscar as respostas e perguntas
    const responses = await Resposta.findAll({
      where: { respondentSessionId, tenantId },
      include: [
        {
          model: Pergunta,
          as: 'pergunta',
          attributes: ['text', 'type', 'options']
        }
      ],
      order: [['pergunta', 'order', 'ASC']]
    });

    if (responses.length === 0) return null;

    // 2. Buscar o cliente
    const client = await Client.findOne({
      where: { respondentSessionId, tenantId }
    });

    // 3. Buscar a pesquisa (configuração)
    const survey = await Pesquisa.findByPk(responses[0].pesquisaId);

    // 4. Buscar o cupom gerado para este cliente e esta pesquisa
    let coupon = null;
    if (client) {
      coupon = await Cupom.findOne({
        where: { 
          pesquisaId: survey.id, 
          clienteId: client.id,
          tenantId
        },
        include: [{ model: Recompensa, as: 'recompensa' }]
      });
    }

    return {
      respondentSessionId,
      survey,
      client,
      responses,
      coupon
    };
  }

  /**
   * Cancela uma participação e invalida o cupom
   */
  async cancelParticipation(respondentSessionId, tenantId, reason) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Buscar o cliente para achar o cupom
      const client = await Client.findOne({
        where: { respondentSessionId, tenantId },
        transaction
      });

      if (client) {
        // 2. Invalida o cupom associado
        await Cupom.update(
          { 
            status: 'canceled',
            cancellationReason: reason
          },
          { 
            where: { 
              clienteId: client.id, 
              tenantId,
              status: { [Op.in]: ['active', 'pending'] }
            },
            transaction
          }
        );
      }

      // 3. Marca as respostas como canceladas
      await Resposta.update(
        { 
          // Assumindo que você adicionará estas colunas na tabela 'respostas'
          // isCanceled: true, 
          // cancellationReason: reason 
        },
        {
          where: { respondentSessionId, tenantId },
          transaction
        }
      );
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new AuditRepository();
