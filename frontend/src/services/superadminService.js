import apiAuthenticated from './apiAuthenticated';

const superadminService = {
    loginAsTenant: (tenantId) => apiAuthenticated.post(`/superadmin/login-as-tenant/${tenantId}`)
};

export default superadminService;
