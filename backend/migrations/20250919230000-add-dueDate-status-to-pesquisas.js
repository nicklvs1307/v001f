'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('pesquisas', 'startDate', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.addColumn('pesquisas', 'endDate', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.addColumn('pesquisas', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'draft',
    });
    await queryInterface.addColumn('pesquisas', 'askForAttendant', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('pesquisas', 'expectedRespondents', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('pesquisas', 'isOpen', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('pesquisas', 'startDate');
    await queryInterface.removeColumn('pesquisas', 'endDate');
    await queryInterface.removeColumn('pesquisas', 'status');
    await queryInterface.removeColumn('pesquisas', 'askForAttendant');
    await queryInterface.removeColumn('pesquisas', 'expectedRespondents');
    await queryInterface.removeColumn('pesquisas', 'isOpen');
  }
};
