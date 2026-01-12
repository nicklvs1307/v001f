'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('roleta_premios', 'isNoPrizeOption', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('roleta_premios', 'isNoPrizeOption');
  }
};
