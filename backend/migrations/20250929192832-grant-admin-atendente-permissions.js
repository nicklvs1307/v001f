'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    const createAtendentePermission = await queryInterface.rawSelect('permissoes', {
      where: { module: 'atendentes', action: 'create' },
    }, ['id']);

    const updateAtendentePermission = await queryInterface.rawSelect('permissoes', {
      where: { module: 'atendentes', action: 'update' },
    }, ['id']);

    if (adminRole && createAtendentePermission) {
      await queryInterface.bulkInsert('role_permissoes', [{
        roleId: adminRole,
        permissaoId: createAtendentePermission,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    }

    if (adminRole && updateAtendentePermission) {
      await queryInterface.bulkInsert('role_permissoes', [{
        roleId: adminRole,
        permissaoId: updateAtendentePermission,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    }
  },

  async down(queryInterface, Sequelize) {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    const createAtendentePermission = await queryInterface.rawSelect('permissoes', {
      where: { module: 'atendentes', action: 'create' },
    }, ['id']);

    const updateAtendentePermission = await queryInterface.rawSelect('permissoes', {
      where: { module: 'atendentes', action: 'update' },
    }, ['id']);

    if (adminRole && createAtendentePermission) {
      await queryInterface.bulkDelete('role_permissoes', {
        roleId: adminRole,
        permissaoId: createAtendentePermission,
      });
    }

    if (adminRole && updateAtendentePermission) {
      await queryInterface.bulkDelete('role_permissoes', {
        roleId: adminRole,
        permissaoId: updateAtendentePermission,
      });
    }
  }
};