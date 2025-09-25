'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissionId = uuidv4();
    await queryInterface.bulkInsert('permissoes', [{
      id: permissionId,
      module: 'surveys',
      action: 'update',
      description: 'Permite a atualização de pesquisas',
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);

    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (adminRole) {
      await queryInterface.bulkInsert('role_permissoes', [{
        roleId: adminRole,
        permissaoId: permissionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const permission = await queryInterface.rawSelect('permissoes', {
      where: {
        module: 'surveys',
        action: 'update',
      },
    }, ['id']);

    if (permission) {
      await queryInterface.bulkDelete('role_permissoes', {
        permissaoId: permission,
      });

      await queryInterface.bulkDelete('permissoes', {
        id: permission,
      });
    }
  }
};