'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (!adminRole) {
      console.log("O cargo 'Admin' não foi encontrado. Pulando a adição de permissões de roletas.");
      return;
    }

    const permissions = [
      { module: 'roletas', action: 'create', description: 'Criar Roletas' },
      { module: 'roletas', action: 'read', description: 'Visualizar Roletas' },
      { module: 'roletas', action: 'update', description: 'Atualizar Roletas' },
      { module: 'roletas', action: 'delete', description: 'Deletar Roletas' },
    ];

    for (const p of permissions) {
      let permissionId = await queryInterface.rawSelect('permissoes', {
        where: { module: p.module, action: p.action },
      }, ['id']);

      if (!permissionId) {
        await queryInterface.bulkInsert('permissoes', [{
          id: Sequelize.literal('uuid_generate_v4()'),
          ...p,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
        permissionId = await queryInterface.rawSelect('permissoes', {
          where: { module: p.module, action: p.action },
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
    }
  },

  down: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (!adminRole) {
      return;
    }

    const permissions = [
      { module: 'roletas', action: 'create' },
      { module: 'roletas', action: 'read' },
      { module: 'roletas', action: 'update' },
      { module: 'roletas', action: 'delete' },
    ];

    for (const p of permissions) {
      const permission = await queryInterface.rawSelect('permissoes', {
        where: { module: p.module, action: p.action },
      }, ['id']);

      if (permission) {
        await queryInterface.bulkDelete('role_permissoes', {
          roleId: adminRole,
          permissaoId: permission,
        });
      }
    }
  }
};
