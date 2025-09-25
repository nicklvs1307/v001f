'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Encontrar e corrigir a permissão de 'write' para 'create'
      const writePermission = await queryInterface.sequelize.query(
        `SELECT id FROM permissoes WHERE module = 'criterios' AND action = 'write' LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (writePermission && writePermission.length > 0) {
        const permissionToFixId = writePermission[0].id;
        await queryInterface.sequelize.query(
          `UPDATE permissoes SET action = 'create' WHERE id = '${permissionToFixId}'`,
          { transaction }
        );
        console.log('Permissão "criterios:write" foi corrigida para "criterios:create".');
      }

      // 2. Obter o ID da role 'Admin'
      const adminRole = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'Admin' LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (!adminRole || adminRole.length === 0) {
        console.log('Role "Admin" não encontrada. Pulando associação.');
        await transaction.commit();
        return;
      }
      const adminRoleId = adminRole[0].id;

      // 3. Obter o ID da permissão (agora corrigida) 'criterios:create'
      const createCriteriosPermission = await queryInterface.sequelize.query(
        `SELECT id FROM permissoes WHERE module = 'criterios' AND action = 'create' LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (!createCriteriosPermission || createCriteriosPermission.length === 0) {
        console.log('Permissão "criterios:create" não encontrada. Não foi possível associar.');
        await transaction.commit();
        return;
      }
      const permissionId = createCriteriosPermission[0].id;

      // 4. Verificar se a associação já existe
      const existingAssociation = await queryInterface.sequelize.query(
        `SELECT * FROM role_permissoes WHERE "roleId" = '${adminRoleId}' AND "permissaoId" = '${permissionId}' LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      // 5. Se não existir, insere a nova associação
      if (existingAssociation.length === 0) {
        await queryInterface.bulkInsert('role_permissoes', [{
          roleId: adminRoleId,
          permissaoId: permissionId,
          createdAt: new Date(),
          updatedAt: new Date()
        }], { transaction });
        console.log('Permissão "criterios:create" adicionada à role "Admin".');
      } else {
        console.log('Associação "Admin" <-> "criterios:create" já existe.');
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao executar a migração para corrigir permissão de critérios:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log("Opcional: A migração 'down' para fix-admin-criterios-permission não desfaz as correções para evitar quebras.");
  }
};