'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('pesquisas');
    if (!tableDescription.startDate) {
      await queryInterface.addColumn('pesquisas', 'startDate', {
        type: Sequelize.DATE,
        allowNull: false,
      });
    }
    if (!tableDescription.endDate) {
      await queryInterface.addColumn('pesquisas', 'endDate', {
        type: Sequelize.DATE,
        allowNull: false,
      });
    }
    if (!tableDescription.status) {
      await queryInterface.addColumn('pesquisas', 'status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'draft',
      });
    }
    if (!tableDescription.askForAttendant) {
      await queryInterface.addColumn('pesquisas', 'askForAttendant', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
    if (!tableDescription.expectedRespondents) {
      await queryInterface.addColumn('pesquisas', 'expectedRespondents', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!tableDescription.isOpen) {
      await queryInterface.addColumn('pesquisas', 'isOpen', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('pesquisas');
    if (tableDescription.startDate) {
      await queryInterface.removeColumn('pesquisas', 'startDate');
    }
    if (tableDescription.endDate) {
      await queryInterface.removeColumn('pesquisas', 'endDate');
    }
    if (tableDescription.status) {
      await queryInterface.removeColumn('pesquisas', 'status');
    }
    if (tableDescription.askForAttendant) {
      await queryInterface.removeColumn('pesquisas', 'askForAttendant');
    }
    if (tableDescription.expectedRespondents) {
      await queryInterface.removeColumn('pesquisas', 'expectedRespondents');
    }
    if (tableDescription.isOpen) {
      await queryInterface.removeColumn('pesquisas', 'isOpen');
    }
  }
};
