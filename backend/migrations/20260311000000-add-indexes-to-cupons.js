'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('cupons', ['tenantId']);
    await queryInterface.addIndex('cupons', ['status']);
    await queryInterface.addIndex('cupons', ['dataGeracao']);
    await queryInterface.addIndex('cupons', ['codigo']);
    // Índice composto para melhorar buscas por tenant e status simultaneamente
    await queryInterface.addIndex('cupons', ['tenantId', 'status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('cupons', ['tenantId']);
    await queryInterface.removeIndex('cupons', ['status']);
    await queryInterface.removeIndex('cupons', ['dataGeracao']);
    await queryInterface.removeIndex('cupons', ['codigo']);
    await queryInterface.removeIndex('cupons', ['tenantId', 'status']);
  }
};
