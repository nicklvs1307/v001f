import apiAuthenticated from './apiAuthenticated';

const franchisorReportService = {
  getConsolidatedReport: (format) => {
    return apiAuthenticated.get(`/franchisor/reports/consolidated?format=${format}`, {
      responseType: 'blob',
    });
  }
};

export default franchisorReportService;
