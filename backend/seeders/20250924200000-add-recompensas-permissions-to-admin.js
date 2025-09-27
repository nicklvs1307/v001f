'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (!adminRole) {
      console.log("O cargo 'Admin' não foi encontrado. Pulando a adição de permissões de recompensas.");
      return;
    }

    const permissions = [
      { module: 'recompensas', action: 'read', description: 'Visualizar Recompensas' },
      { module: 'recompensas', action: 'create', description: 'Criar Recompensas' },
      { module: 'recompensas', action: 'update', description: 'Atualizar Recompensas' },
      { module: 'recompensas', action: 'delete', description: 'Deletar Recompensas' },
    ];

    for (const p of permissions) {
      // Verifica se a permissão já existe
      let permissionId = await queryInterface.rawSelect('permissoes', {
        where: { module: p.module, action: p.action },
      }, ['id']);

      // Se não existir, cria a permissão
      if (!permissionId) {
        const newPermissionId = uuidv4();
        await queryInterface.bulkInsert('permissoes', [{
          id: newPermissionId,
          ...p,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
        permissionId = newPermissionId;
      }

      // Verifica se a associação já existe
      const existingLink = await queryInterface.rawSelect('role_permissoes', {
        where: {
          roleId: adminRole,
          permissaoId: permissionId,
        },
      }, ['roleId']);

      // Se não existir, cria a associação
      if (!existingLink) {
        await queryInterface.bulkInsert('role_permissoes', [{
          roleId: adminRole,
          permissaoId: permissionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
        console.log(`Permissão '${p.module}:${p.action}' associada ao cargo Admin.`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (!adminRole) {
      console.log("O cargo 'Admin' não foi encontrado. Pulando a remoção de permissões de recompensas.");
      return;
    }

    const permissions = [
      { module: 'recompensas', action: 'read' },
      { module: 'recompensas', action: 'create' },
      { module: 'recompensas', action: 'update' },
      { module: 'recompensas', action: 'delete' },
    ];

    for (const p of permissions) {
      const permission = await queryInterface.sequelize.query(
        `SELECT id FROM permissoes WHERE module = :module AND action = :action`,
        { replacements: { module: p.module, action: p.action }, type: Sequelize.QueryTypes.SELECT }
      );

      if (permission && permission.length > 0) {
        const permissionId = permission[0].id;
        await queryInterface.bulkDelete('role_permissoes', {
          roleId: adminRole,
          permissaoId: permissionId,
        });
        console.log(`Associação da permissão '${p.module}:${p.action}' removida do cargo Admin.`);
      }
    }
  }
};
