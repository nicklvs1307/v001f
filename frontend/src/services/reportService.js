import apiAuthenticated from './apiAuthenticated';

const reportService = {
  getSuperAdminDashboard: () => {
    return apiAuthenticated.get('/superadmin/reports/dashboard');
  },
  getSystemOverview: () => {
    return apiAuthenticated.get('/superadmin/reports/system-overview');
  },
  getTenantReports: () => {
    return apiAuthenticated.get('/superadmin/reports/tenant-reports');
  },
};

export default reportService;
