'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Etapa 1: Obter o ID da função de administrador
      const adminRole = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE name = 'Admin'",
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (!adminRole.length) {
        console.log('Admin role not found. Skipping seeder.');
        await transaction.commit();
        return;
      }
      const adminRoleId = adminRole[0].id;

      // Etapa 2: definir e criar as novas permissões
      const permissionsToCreate = [
        { id: uuidv4(), module: 'campanhas', action: 'read', description: 'Visualizar Campanhas', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), module: 'campanhas', action: 'create', description: 'Criar/Editar Campanhas', createdAt: new Date(), updatedAt: new Date() }
      ];
      
      await queryInterface.bulkInsert('permissoes', permissionsToCreate, { transaction, ignoreDuplicates: true });

      // Etapa 3: Obtenha os IDs das permissões que acabamos de criar
      const createdPermissions = await queryInterface.sequelize.query(
        "SELECT id, module, action FROM permissoes WHERE module = 'campanhas'",
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      // Etapa 4: crie as associações na tabela de junção
      const rolePermissionsToCreate = createdPermissions.map(perm => ({
        roleId: adminRoleId,
        permissaoId: perm.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await queryInterface.bulkInsert('role_permissoes', rolePermissionsToCreate, { transaction, ignoreDuplicates: true });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Failed to seed campaign permissions:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        const campaignPermissions = await queryInterface.sequelize.query(
            "SELECT id FROM permissoes WHERE module = 'campanhas'",
            { type: Sequelize.QueryTypes.SELECT, transaction }
        );
        const permissionIds = campaignPermissions.map(p => p.id);

        if (permissionIds.length > 0) {
            await queryInterface.bulkDelete('role_permissoes', {
                permissaoId: { [Sequelize.Op.in]: permissionIds }
            }, { transaction });
        }

        await queryInterface.bulkDelete('permissoes', {
            module: 'campanhas'
        }, { transaction });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error('Failed to revert campaign permissions seeder:', error);
        throw error;
    }
  }
};