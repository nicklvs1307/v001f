const dashboardRepository = require("../repositories/dashboardRepository");
const franchisorService = require("./franchisorService");
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

class FranchisorReportService {
  async generateConsolidatedReport(franchisorId, format) {
    const tenantIds = await franchisorService.getTenantIdsForFranchisor(franchisorId);
    const data = await dashboardRepository.getDashboardData(tenantIds);

    if (format === 'pdf') {
      return this.generatePdfReport(data);
    } else {
      return this.generateCsvReport(data);
    }
  }

  generatePdfReport(data) {
    const doc = new PDFDocument();

    doc.fontSize(25).text('Relatório Consolidado', { align: 'center' });
    doc.moveDown();

    doc.fontSize(20).text('Resumo');
    doc.fontSize(12).text(`NPS Geral: ${data.summary.nps.npsScore.toFixed(0)}`);
    doc.text(`Média de Satisfação: ${data.summary.csat.averageScore.toFixed(1)}`);
    doc.text(`Total de Respostas: ${data.summary.totalResponses}`);
    doc.moveDown();

    doc.fontSize(20).text('Performance dos Atendentes');
    data.attendantsPerformance.forEach(attendant => {
        doc.fontSize(12).text(`${attendant.name} - NPS: ${attendant.currentNPS.toFixed(1)}`);
    });
    doc.moveDown();

    // Add more data to the PDF as needed

    doc.end();
    return doc;
  }

  generateCsvReport(data) {
    const fields = [
        { label: 'Nome do Atendente', value: 'name' },
        { label: 'NPS', value: 'currentNPS' },
        { label: 'CSAT', value: 'currentCSAT' },
        { label: 'Respostas', value: 'responses' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(data.attendantsPerformance);
    return csv;
  }
}

module.exports = new FranchisorReportService();
