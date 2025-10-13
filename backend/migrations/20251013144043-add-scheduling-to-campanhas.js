'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('campanhas', 'startDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('campanhas', 'endDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('campanhas', 'startDate');
    await queryInterface.removeColumn('campanhas', 'endDate');
  }
};