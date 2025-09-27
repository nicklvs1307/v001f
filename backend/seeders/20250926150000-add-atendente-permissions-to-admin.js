'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminRoleResult = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'Admin'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const adminRole = adminRoleResult.length > 0 ? adminRoleResult[0].id : null;

    if (!adminRole) {
      console.log("O cargo 'Admin' não foi encontrado. Nenhuma permissão foi adicionada.");
      return;
    }

    const permissions = await queryInterface.sequelize.query(
      `SELECT id, action FROM permissoes WHERE module = 'atendentes' AND (action = 'update' OR action = 'delete')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissionIds = permissions.map(p => p.id);

    let existingRolePermissions = [];
    if (permissionIds.length > 0) {
      existingRolePermissions = await queryInterface.sequelize.query(
          `SELECT "permissaoId" FROM role_permissoes WHERE "roleId" = :roleId AND "permissaoId" IN (:permissionIds)`,
          {
              replacements: { roleId: adminRole, permissionIds: permissionIds },
              type: Sequelize.QueryTypes.SELECT
          }
      );
    }

    const existingPermissionIds = new Set(existingRolePermissions.map(rp => rp.permissaoId));

    const permissionsToInsert = [];
    const requiredActions = new Set(['update', 'delete']);

    for (const action of requiredActions) {
        const permission = permissions.find(p => p.action === action);
        if (permission && !existingPermissionIds.has(permission.id)) {
            permissionsToInsert.push({
                roleId: adminRole.id,
                permissaoId: permission.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } else if (!permission) {
            console.log(`A permissão 'atendentes:${action}' não foi encontrada. Verifique se ela existe na tabela 'permissoes'.`);
        }
    }
    
    if (permissionsToInsert.length > 0) {
      await queryInterface.bulkInsert('role_permissoes', permissionsToInsert, {});
      console.log(`Adicionadas ${permissionsToInsert.length} novas permissões de atendentes para o cargo Admin.`);
    } else {
      console.log("Nenhuma nova permissão de atendente para adicionar ao cargo Admin.");
    }
  },

  async down(queryInterface, Sequelize) {
    const adminRoleResult = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'Admin'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const adminRole = adminRoleResult.length > 0 ? adminRoleResult[0].id : null;

    if (!adminRole) {
      return;
    }

    const permissions = await queryInterface.sequelize.query(
      `SELECT id FROM permissoes WHERE module = 'atendentes' AND (action = 'update' OR action = 'delete')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissionIds = permissions.map(p => p.id);

    if (permissionIds.length > 0) {
      await queryInterface.bulkDelete('role_permissoes', {
        roleId: adminRole,
        permissaoId: { [Sequelize.Op.in]: permissionIds },
      }, {});
    }
  }
};
