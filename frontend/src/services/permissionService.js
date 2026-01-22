import apiAuthenticated from '../apiAuthenticated';

const permissionService = {
    getAllPermissions: () => apiAuthenticated.get('/superadmin/permissions'),
    getAllSystemRoles: () => apiAuthenticated.get('/superadmin/roles'),
    updateRolePermissions: (roleId, permissionIds) => apiAuthenticated.put(`/superadmin/roles/${roleId}/permissions`, { permissionIds }),
};

export default permissionService;
