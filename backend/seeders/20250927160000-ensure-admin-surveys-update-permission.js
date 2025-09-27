'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (!adminRole) {
      console.log("O cargo 'Admin' não foi encontrado. Pulando a adição de permissão de atualização de pesquisas.");
      return;
    }

    let permissionId = await queryInterface.rawSelect('permissoes', {
      where: { module: 'surveys', action: 'update' },
    }, ['id']);

    if (!permissionId) {
      await queryInterface.bulkInsert('permissoes', [{
        id: Sequelize.literal('uuid_generate_v4()'),
        module: 'surveys',
        action: 'update',
        description: 'Permite a atualização de pesquisas',
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
      permissionId = await queryInterface.rawSelect('permissoes', {
        where: { module: 'surveys', action: 'update' },
      }, ['id']);
    }

    const existingLink = await queryInterface.rawSelect('role_permissoes', {
      where: {
        roleId: adminRole,
        permissaoId: permissionId,
      },
    }, ['roleId']);

    if (!existingLink) {
      await queryInterface.bulkInsert('role_permissoes', [{
        roleId: adminRole,
        permissaoId: permissionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (!adminRole) {
      return;
    }

    const permission = await queryInterface.rawSelect('permissoes', {
      where: { module: 'surveys', action: 'update' },
    }, ['id']);

    if (permission) {
      await queryInterface.bulkDelete('role_permissoes', {
        roleId: adminRole,
        permissaoId: permission,
      });
    }
  }
};
