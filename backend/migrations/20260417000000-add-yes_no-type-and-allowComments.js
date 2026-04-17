'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_perguntas_type" ADD VALUE IF NOT EXISTS 'yes_no';
    `);

    await queryInterface.addColumn('perguntas', 'allowComments', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('perguntas', 'allowComments');
  }
};