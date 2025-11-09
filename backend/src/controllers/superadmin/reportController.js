const reportService = require('../../services/superadmin/reportService');
const asyncHandler = require("express-async-handler");

class ReportController {
  async getSystemOverview(req, res, next) {
    try {
      const report = await reportService.getSystemOverviewReport();
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getTenantReports(req, res, next) {
    try {
      const reports = await reportService.getTenantReports();
      res.status(200).json(reports);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
