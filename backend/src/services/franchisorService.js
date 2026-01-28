const { Franchisor, Tenant } = require("../../models");
const dashboardRepository = require("../repositories/dashboardRepository");
const ApiError = require("../errors/ApiError");

class FranchisorService {
  /**
   * Obtém a lista de IDs de tenants (franqueados) para um dado franqueador.
   * @param {string} franchisorId - O ID do franqueador.
   * @returns {Promise<string[]>} - Uma promessa que resolve para um array de IDs de tenant.
   */
  async getTenantIdsForFranchisor(franchisorId) {
    const tenants = await Tenant.findAll({
      where: { franchisorId },
      attributes: ["id"],
      raw: true,
    });
    return tenants.map((t) => t.id);
  }

  /**
   * Obtém os dados do dashboard agregado para um franqueador.
   * @param {string} franchisorId - O ID do franqueador.
   * @param {object} queryParams - Parâmetros de filtro (startDate, endDate, etc.).
   * @returns {Promise<object>} - Os dados do dashboard agregado.
   */
  async getAggregatedDashboardData(franchisorId, queryParams) {
    if (!franchisorId) {
      throw new ApiError(
        401,
        "Acesso não autorizado. ID de franqueador não encontrado.",
      );
    }

    // 1. Obter a lista de tenant IDs para este franqueador
    const tenantIds = await this.getTenantIdsForFranchisor(franchisorId);

    if (tenantIds.length === 0) {
      // Se não houver franqueados, retorna um objeto de dados vazio ou padrão
      return { message: "Nenhum franqueado associado a esta franqueadora." };
    }

    // 2. Chamar a função do repositório de dashboard com o array de IDs
    const { startDate, endDate, period, surveyId } = queryParams;
    const dashboardData = await dashboardRepository.getDashboardData(
      tenantIds,
      startDate,
      endDate,
      period,
      surveyId,
    );

    return dashboardData;
  }

  /**
   * Obtém a lista de franqueados (tenants) para um dado franqueador.
   * @param {string} franchisorId - O ID do franqueador.
   * @returns {Promise<Tenant[]>} - Uma promessa que resolve para um array de tenants.
   */
  async getFranchisees(franchisorId) {
    if (!franchisorId) {
      throw new ApiError(
        401,
        "Acesso não autorizado. ID de franqueador não encontrado.",
      );
    }

    const franchisees = await Tenant.findAll({
      where: { franchisorId },
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "uairangoEstablishmentId",
        "document",
        "createdAt",
      ],
    });

    return franchisees;
  }
}

module.exports = new FranchisorService();
