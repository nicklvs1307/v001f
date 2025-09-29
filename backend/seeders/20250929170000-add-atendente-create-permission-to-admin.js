'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: {
        name: 'Admin',
      },
    }, ['id']);

    if (adminRole) {
      const permission = await queryInterface.sequelize.query(
        `SELECT id FROM permissoes WHERE module = 'atendentes' AND action = 'create'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (permission && permission.length > 0) {
        const rolePermission = {
          roleId: adminRole,
          permissaoId: permission[0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await queryInterface.bulkInsert('role_permissoes', [rolePermission], {});
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: {
        name: 'Admin',
      },
    }, ['id']);

    if (adminRole) {
      const permission = await queryInterface.sequelize.query(
        `SELECT id FROM permissoes WHERE module = 'atendentes' AND action = 'create'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (permission && permission.length > 0) {
        await queryInterface.bulkDelete('role_permissoes', {
          roleId: adminRole,
          permissaoId: permission[0].id,
        });
      }
    }
  }
};
