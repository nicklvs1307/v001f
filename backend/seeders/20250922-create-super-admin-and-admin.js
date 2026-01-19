
'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Criar Roles
      const superAdminRole = await queryInterface.bulkInsert('roles', [{
        id: uuidv4(),
        name: 'Super Admin',
        key: 'super_admin',
        description: 'Usuário com acesso total ao sistema, sem restrição de tenant.',
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction, ignoreDuplicates: true });

      const adminRole = await queryInterface.bulkInsert('roles', [{
        id: uuidv4(),
        name: 'Admin',
        key: 'admin',
        description: 'Administrador de um tenant específico.',
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction, ignoreDuplicates: true });

      const superAdminRoleId = (await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'Super Admin'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      ))[0].id;

      const adminRoleId = (await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'Admin'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      ))[0].id;

      // 2. Criar Permissões (exemplo, adicione mais conforme necessário)
      const permissions = [
        { id: uuidv4(), module: 'users', action: 'read', description: 'Visualizar usuários', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'users', action: 'update', description: 'Criar/Editar usuários', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'tenants', action: 'read', description: 'Visualizar tenants', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'tenants', action: 'update', description: 'Criar/Editar tenants', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'roles', action: 'read', description: 'Visualizar roles', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'roles', action: 'create', description: 'Criar/Editar roles', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'surveys', action: 'read', description: 'Visualizar pesquisas', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'surveys', action: 'create', description: 'Criar/Editar pesquisas', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'dashboard', action: 'read', description: 'Visualizar dashboard', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'dashboard', action: 'create', description: 'Criar/Editar dashboard', createdAt: new Date(), updatedAt: new Date() }, // Adicionado
        { id: uuidv4(), module: 'atendentes', action: 'read', description: 'Visualizar atendentes', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'atendentes', action: 'create', description: 'Criar/Editar atendentes', createdAt: new Date(), updatedAt: new Date() }, // Adicionado
        { id: uuidv4(), module: 'criterios', action: 'read', description: 'Visualizar critérios', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'criterios', action: 'create', description: 'Criar critérios', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'criterios', action: 'update', description: 'Editar critérios', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'criterios', action: 'delete', description: 'Deletar critérios', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'recompensas', action: 'read', description: 'Visualizar recompensas', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'recompensas', action: 'create', description: 'Criar/Editar recompensas', createdAt: new Date(), updatedAt: new Date() }, // Adicionado
        { id: uuidv4(), module: 'cupons', action: 'read', description: 'Visualizar cupons', createdAt: new Date(), updatedAt: new Date() }, // Adicionado
        { id: uuidv4(), module: 'cupons', action: 'create', description: 'Criar/Editar cupons', createdAt: new Date(), updatedAt: new Date() }, // Adicionado
      ];

      await queryInterface.bulkInsert('permissoes', permissions, { transaction, ignoreDuplicates: true });

      const permissionIdentifiers = permissions.map(p => `('${p.module}', '${p.action}')`).join(',');
      const createdPermissions = await queryInterface.sequelize.query(
        `SELECT id FROM permissoes WHERE (module, action) IN (${permissionIdentifiers})`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      // 3. Associar Permissões às Roles
      const rolePermissions = [];

      // Super Admin tem todas as permissões
      createdPermissions.forEach(perm => {
        rolePermissions.push({
          roleId: superAdminRoleId,
          permissaoId: perm.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      // Admin tem todas as permissões (conforme solicitação)
      createdPermissions.forEach(perm => {
        rolePermissions.push({
          roleId: adminRoleId,
          permissaoId: perm.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      await queryInterface.bulkInsert('role_permissoes', rolePermissions, { transaction, ignoreDuplicates: true });

      // 4. Criar Tenant para o Admin
      const tenantId = uuidv4();
      await queryInterface.bulkInsert('tenants', [{
        id: tenantId,
        name: 'Empresa de Exemplo',
        address: 'Rua Exemplo, 123',
        phone: '11987654321',
        email: 'contato@empresaexemplo.com',
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        description: 'Uma empresa de exemplo para testes.',
        website: 'https://empresaexemplo.com',
        cnpj: '00.000.000/0001-00',
        inscricaoEstadual: 'ISENTO',
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction, ignoreDuplicates: true });

      // 5. Criar Super Admin
      const superAdminPasswordHash = await bcrypt.hash('superadmin123', 10);
      await queryInterface.bulkInsert('usuarios', [{
        id: uuidv4(),
        tenantId: null, // Super Admin não tem tenantId
        roleId: superAdminRoleId,
        name: 'Super Admin',
        email: 'superadmin@loyalfood.com',
        passwordHash: superAdminPasswordHash,
        profilePictureUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction, ignoreDuplicates: true });

      // 6. Criar Admin
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      await queryInterface.bulkInsert('usuarios', [{
        id: uuidv4(),
        tenantId: tenantId,
        roleId: adminRoleId,
        name: 'Admin da Empresa',
        email: 'admin@empresaexemplo.com',
        passwordHash: adminPasswordHash,
        profilePictureUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction, ignoreDuplicates: true });

      await transaction.commit();
      console.log('Seeder de Super Admin e Admin executado com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao executar o seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remover usuários
      await queryInterface.bulkDelete('usuarios', {
        email: ['superadmin@loyalfood.com', 'admin@loyalfood.com']
      }, { transaction });

      // Remover tenant
      await queryInterface.bulkDelete('tenants', {
        name: 'Empresa de Exemplo'
      }, { transaction });

      // Remover associações de permissões
      const superAdminRoleId = (await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'Super Admin'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      ))[0]?.id;

      const adminRoleId = (await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'Admin'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      ))[0]?.id;

      if (superAdminRoleId) {
        await queryInterface.bulkDelete('role_permissoes', { roleId: superAdminRoleId }, { transaction });
      }
      if (adminRoleId) {
        await queryInterface.bulkDelete('role_permissoes', { roleId: adminRoleId }, { transaction });
      }

      // Remover permissões (apenas as criadas neste seeder)
      const permissionsToDelete = [
        { module: 'users', action: 'read' }, { module: 'users', action: 'update' },
        { module: 'tenants', action: 'read' }, { module: 'tenants', action: 'update' },
        { module: 'roles', action: 'read' }, { module: 'roles', action: 'create' },
        { module: 'surveys', action: 'read' }, { module: 'surveys', action: 'create' },
        { module: 'dashboard', action: 'read' }, { module: 'dashboard', action: 'create' },
        { module: 'atendentes', action: 'read' }, { module: 'atendentes', action: 'create' },
        { module: 'criterios', action: 'read' }, { module: 'criterios', action: 'create' }, { module: 'criterios', action: 'update' }, { module: 'criterios', action: 'delete' },
        { module: 'recompensas', action: 'read' }, { module: 'recompensas', action: 'create' },
        { module: 'cupons', action: 'read' }, { module: 'cupons', action: 'create' },
      ];
      
      const orConditions = permissionsToDelete.map(p => ({ module: p.module, action: p.action }));

      await queryInterface.bulkDelete('permissoes', {
        [Sequelize.Op.or]: orConditions
      }, { transaction });

      // Remover roles
      await queryInterface.bulkDelete('roles', {
        name: ['Super Admin', 'Admin']
      }, { transaction });

      await transaction.commit();
      console.log('Seeder de Super Admin e Admin revertido com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao reverter o seeder:', error);
      throw error;
    }
  }
};
