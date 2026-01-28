const asyncHandler = require("express-async-handler");
const franchisorService = require("../services/franchisorService");
const { parseISO, startOfDay, endOfDay } = require("date-fns");

const franchisorController = {
  /**
   * Obtém os dados do dashboard agregado para o franqueador autenticado.
   */
  getDashboard: asyncHandler(async (req, res) => {
    const { franchisorId } = req.user; // O franchisorId será injetado no req.user pelo middleware de autenticação
    const { surveyId, period } = req.query;

    // Tratamento de datas
    let startDate, endDate;
    if (req.query.startDate) {
      startDate = startOfDay(parseISO(req.query.startDate));
    }
    if (req.query.endDate) {
      endDate = endOfDay(parseISO(req.query.endDate));
    }

    const queryParams = { startDate, endDate, surveyId, period };

    const dashboardData = await franchisorService.getAggregatedDashboardData(
      franchisorId,
      queryParams,
    );

    res.status(200).json(dashboardData);
  }),

  /**
   * Obtém a lista de franqueados para o franqueador autenticado.
   */
  getFranchisees: asyncHandler(async (req, res) => {
    const { franchisorId } = req.user;
    const franchisees = await franchisorService.getFranchisees(franchisorId);
    res.status(200).json(franchisees);
  }),
};

module.exports = franchisorController;
