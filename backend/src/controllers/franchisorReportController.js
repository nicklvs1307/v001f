const asyncHandler = require("express-async-handler");
const franchisorReportService = require("../services/franchisorReportService");

const franchisorReportController = {
  generateConsolidatedReport: asyncHandler(async (req, res) => {
    const { franchisorId } = req.user;
    const { format } = req.query; // pdf or csv

    const report = await franchisorReportService.generateConsolidatedReport(franchisorId, format);

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
      report.pipe(res);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
      res.status(200).send(report);
    }
  }),
};

module.exports = franchisorReportController;
