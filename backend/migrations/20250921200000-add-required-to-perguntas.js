'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('perguntas');
    if (!tableDescription.required) {
      await queryInterface.addColumn('perguntas', 'required', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('perguntas');
    if (tableDescription.required) {
      await queryInterface.removeColumn('perguntas', 'required');
    }
  }
};