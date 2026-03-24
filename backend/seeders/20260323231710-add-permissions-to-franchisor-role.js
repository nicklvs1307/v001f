'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Obter o papel de Franqueador
      const [roles] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE name = 'Franqueador' LIMIT 1;",
        { transaction }
      );

      if (roles.length === 0) {
        throw new Error("Papel de Franqueador não encontrado.");
      }
      const roleId = roles[0].id;

      // 2. Definir permissões para franqueador
      const permissionsToGrant = [
        { module: 'tenants', action: 'read' },
        { module: 'tenants', action: 'create' },
        { module: 'tenants', action: 'update' },
        { module: 'users', action: 'read' },
        { module: 'users', action: 'create' },
        { module: 'users', action: 'update' },
        { module: 'users', action: 'delete' },
        { module: 'surveys', action: 'read' }, // Para ver os resultados das unidades
        { module: 'dashboards', action: 'read' },
        { module: 'reports', action: 'read' }
      ];

      // 3. Obter IDs das permissões e criar associações
      for (const p of permissionsToGrant) {
        const [perms] = await queryInterface.sequelize.query(
          `SELECT id FROM permissoes WHERE module = '${p.module}' AND action = '${p.action}' LIMIT 1;`,
          { transaction }
        );

        if (perms.length > 0) {
          const permissaoId = perms[0].id;
          // Inserir na tabela role_permissoes se não existir
          await queryInterface.bulkInsert('role_permissoes', [{
            roleId: roleId,
            permissaoId: permissaoId,
            createdAt: new Date(),
            updatedAt: new Date()
          }], { transaction, ignoreDuplicates: true });
        }
      }

      await transaction.commit();
      console.log('Permissões concedidas ao papel de Franqueador com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao conceder permissões ao Franqueador:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [roles] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE name = 'Franqueador' LIMIT 1;",
        { transaction }
      );

      if (roles.length > 0) {
        await queryInterface.bulkDelete('role_permissoes', { roleId: roles[0].id }, { transaction });
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
