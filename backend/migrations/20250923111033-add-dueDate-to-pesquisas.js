'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('pesquisas');
    if (!tableDescription.dueDate) {
      await queryInterface.addColumn('pesquisas', 'dueDate', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('pesquisas');
    if (tableDescription.dueDate) {
      await queryInterface.removeColumn('pesquisas', 'dueDate');
    }
  }
};