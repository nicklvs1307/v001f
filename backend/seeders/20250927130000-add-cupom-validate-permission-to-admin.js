'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (adminRole) {
      let permissionId;
      const permission = await queryInterface.rawSelect('permissoes', {
        where: { name: 'cupons:validate' },
      }, ['id']);

      if (!permission) {
        // Cria a permissão se ela não existir
        await queryInterface.bulkInsert('permissoes', [{
          id: Sequelize.literal('uuid_generate_v4()'),
          name: 'cupons:validate',
          description: 'Permite a validação de cupons',
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
        permissionId = await queryInterface.rawSelect('permissoes', {
          where: { name: 'cupons:validate' },
        }, ['id']);
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
  },

  down: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    const permission = await queryInterface.rawSelect('permissoes', {
      where: { name: 'cupons:validate' },
    }, ['id']);

    if (adminRole && permission) {
      await queryInterface.bulkDelete('role_permissoes', {
        roleId: adminRole,
        permissaoId: permission
      });
    }
  }
};
