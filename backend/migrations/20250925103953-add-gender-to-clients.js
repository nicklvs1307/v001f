'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('clients');
    if (!tableDescription.gender) {
      await queryInterface.addColumn('clients', 'gender', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('clients');
    if (tableDescription.gender) {
      await queryInterface.removeColumn('clients', 'gender');
    }
  }
};