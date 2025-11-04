'use strict';

const { v4: uuidv4 } = require('uuid');

// Lista de permissões essenciais para o papel de Admin
const adminPermissions = [
  // Dashboard
  { module: 'dashboard', action: 'read', description: 'Acessar o dashboard principal' },

  // Usuários do Sistema
  { module: 'users', action: 'create', description: 'Criar usuários do sistema' },
  { module: 'users', action: 'read', description: 'Visualizar usuários do sistema' },
  { module: 'users', action: 'update', description: 'Atualizar usuários do sistema' },
  { module: 'users', action: 'delete', description: 'Deletar usuários do sistema' },

  // Cargos e Permissões
  { module: 'roles', action: 'create', description: 'Criar cargos' },
  { module: 'roles', action: 'read', description: 'Visualizar cargos' },
  { module: 'roles', action: 'update', description: 'Atualizar cargos' },
  { module: 'roles', action: 'delete', description: 'Deletar cargos' },

  // Pesquisas
  { module: 'surveys', action: 'create', description: 'Criar pesquisas' },
  { module: 'surveys', action: 'read', description: 'Visualizar pesquisas' },
  { module: 'surveys', action: 'update', description: 'Atualizar pesquisas' },
  { module: 'surveys', action: 'delete', description: 'Deletar pesquisas' },

  // Clientes
  { module: 'clients', action: 'read', description: 'Visualizar clientes' },
  { module: 'clients', action: 'update', description: 'Atualizar clientes' },

  // Atendentes
  { module: 'atendentes', action: 'create', description: 'Criar atendentes' },
  { module: 'atendentes', action: 'read', description: 'Visualizar atendentes' },
  { module: 'atendentes', action: 'update', description: 'Atualizar atendentes' },
  { module: 'atendentes', action: 'delete', description: 'Deletar atendentes' },
  
  // Recompensas
  { module: 'recompensas', action: 'create', description: 'Criar recompensas' },
  { module: 'recompensas', action: 'read', description: 'Visualizar recompensas' },
  { module: 'recompensas', action: 'update', description: 'Atualizar recompensas' },
  { module: 'recompensas', action: 'delete', description: 'Deletar recompensas' },

  // Cupons
  { module: 'cupons', action: 'read', description: 'Visualizar cupons' },
  { module: 'cupons', action: 'validate', description: 'Validar cupons' },

  // Resultados
  { module: 'results', action: 'read', description: 'Visualizar resultados consolidados' },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const adminRole = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'Admin'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (!adminRole || adminRole.length === 0) {
        console.log('O cargo \'Admin\' não foi encontrado. Pulando a garantia de permissões base.');
        await transaction.commit();
        return;
      }
      const adminRoleId = adminRole[0].id;

      for (const perm of adminPermissions) {
        // 1. Verificar se a permissão existe, se não, criar.
        let permission = await queryInterface.sequelize.query(
          `SELECT id FROM permissoes WHERE module = :module AND action = :action`,
          {
            replacements: { module: perm.module, action: perm.action },
            type: Sequelize.QueryTypes.SELECT,
            transaction
          }
        );

        let permissionId;
        if (!permission || permission.length === 0) {
          const newPermissionId = uuidv4();
          await queryInterface.bulkInsert('permissoes', [
            {
              id: newPermissionId,
              module: perm.module,
              action: perm.action,
              description: perm.description,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ], { transaction });
          permissionId = newPermissionId;
        } else {
          permissionId = permission[0].id;
        }

        // 2. Verificar se a associação existe, se não, criar.
        const existingLink = await queryInterface.sequelize.query(
          `SELECT "roleId" FROM role_permissoes WHERE "roleId" = :roleId AND "permissaoId" = :permissaoId`,
          {
            replacements: { roleId: adminRoleId, permissaoId: permissionId },
            type: Sequelize.QueryTypes.SELECT,
            transaction
          }
        );

        if (!existingLink || existingLink.length === 0) {
          await queryInterface.bulkInsert('role_permissoes', [
            {
              roleId: adminRoleId,
              permissaoId: permissionId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ], { transaction });
        }
      }

      await transaction.commit();
      console.log('Permissões base do Admin garantidas com sucesso.');
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao garantir as permissões base do Admin:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Opcional: O down pode remover as permissões ou fazer nada.
    // Por segurança, é melhor não remover permissões automaticamente.
    console.log('O downgrade do seeder de permissões base não remove as permissões automaticamente.');
  }
};
