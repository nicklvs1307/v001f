'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (!adminRole) {
      console.log("O cargo 'Admin' não foi encontrado. Nenhuma permissão foi adicionada.");
      return;
    }

    const permissions = await queryInterface.sequelize.query(
      `SELECT id, action FROM permissoes WHERE module = 'atendentes' AND (action = 'update' OR action = 'delete')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissionsToInsert = [];
    const requiredActions = new Set(['update', 'delete']);

    for (const action of requiredActions) {
        const permission = permissions.find(p => p.action === action);
        if (permission) {
            permissionsToInsert.push({
                roleId: adminRole,
                permissaoId: permission.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } else {
            console.log(`A permissão 'atendentes:${action}' não foi encontrada. Verifique se ela existe na tabela 'permissoes'.`);
        }
    }
    
    if (permissionsToInsert.length > 0) {
      await queryInterface.bulkInsert('role_permissoes', permissionsToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    const adminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'Admin' },
    }, ['id']);

    if (!adminRole) {
      return;
    }

    const permissions = await queryInterface.sequelize.query(
      `SELECT id FROM permissoes WHERE module = 'atendentes' AND (action = 'update' OR action = 'delete')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissionIds = permissions.map(p => p.id);

    if (permissionIds.length > 0) {
      await queryInterface.bulkDelete('role_permissoes', {
        roleId: adminRole,
        permissaoId: { [Sequelize.Op.in]: permissionIds },
      }, {});
    }
  }
};
