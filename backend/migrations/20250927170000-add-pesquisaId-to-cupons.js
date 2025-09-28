'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('cupons', 'pesquisaId', {
      type: Sequelize.UUID,
      references: {
        model: 'pesquisas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('cupons', 'pesquisaId');
  },
};