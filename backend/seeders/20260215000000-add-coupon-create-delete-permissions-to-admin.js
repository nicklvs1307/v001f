'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (adminRole) {
      const permissionsToAdd = [
        { module: 'cupons', action: 'create', description: 'Permite a criação de cupons' },
        { module: 'cupons', action: 'delete', description: 'Permite a exclusão e cancelamento de cupons' }
      ];

      for (const perm of permissionsToAdd) {
        let permissionId;
        const permission = await queryInterface.rawSelect('permissoes', {
          where: { module: perm.module, action: perm.action },
        }, ['id']);

        if (!permission) {
          // Cria a permissão se ela não existir
          await queryInterface.bulkInsert('permissoes', [{
            id: Sequelize.literal('uuid_generate_v4()'),
            module: perm.module,
            action: perm.action,
            description: perm.description,
            createdAt: new Date(),
            updatedAt: new Date()
          }]);
          
          const newPerm = await queryInterface.sequelize.query(
            `SELECT id FROM permissoes WHERE module = :module AND action = :action`,
            {
              replacements: { module: perm.module, action: perm.action },
              type: Sequelize.QueryTypes.SELECT
            }
          );
          permissionId = newPerm[0].id;
        } else {
          permissionId = permission;
        }

        // Associa a permissão ao papel Admin
        const rolePermissionExists = await queryInterface.rawSelect('role_permissoes', {
          where: {
            roleId: adminRole,
            permissaoId: permissionId
          }
        }, ['roleId']);

        if (!rolePermissionExists) {
          await queryInterface.bulkInsert('role_permissoes', [{
            roleId: adminRole,
            permissaoId: permissionId,
            createdAt: new Date(),
            updatedAt: new Date()
          }]);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (adminRole) {
      const permissions = await queryInterface.sequelize.query(
        `SELECT id FROM permissoes WHERE module = 'cupons' AND action IN ('create', 'delete')`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (permissions.length > 0) {
        const permissionIds = permissions.map(p => p.id);
        await queryInterface.bulkDelete('role_permissoes', {
          roleId: adminRole,
          permissaoId: permissionIds
        });
      }
    }
  }
};
