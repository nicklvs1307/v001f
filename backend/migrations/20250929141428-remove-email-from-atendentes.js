'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('atendentes', 'email');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('atendentes', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};