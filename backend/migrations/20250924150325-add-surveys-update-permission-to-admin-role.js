'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    const surveyUpdatePermission = await queryInterface.rawSelect('permissoes', {
      where: {
        module: 'surveys',
        action: 'update',
      },
    }, ['id']);

    if (adminRole && surveyUpdatePermission) {
      await queryInterface.bulkInsert('role_permissoes', [{
        roleId: adminRole,
        permissaoId: surveyUpdatePermission,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    } else {
      if (!adminRole) {
        console.log("Função 'Admin' não encontrada.");
      }
      if (!surveyUpdatePermission) {
        console.log("Permissão 'surveys:update' não encontrada.");
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    const surveyUpdatePermission = await queryInterface.rawSelect('permissoes', {
      where: {
        module: 'surveys',
        action: 'update',
      },
    }, ['id']);

    if (adminRole && surveyUpdatePermission) {
      await queryInterface.bulkDelete('role_permissoes', {
        roleId: adminRole,
        permissaoId: surveyUpdatePermission,
      });
    }
  }
};