'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tenants', 'ifoodAuthVerifier', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tenants', 'ifoodAuthVerifier');
  }
};
