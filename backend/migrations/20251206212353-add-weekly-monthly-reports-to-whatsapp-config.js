'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('whatsapp_configs', 'weeklyReportEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('whatsapp_configs', 'monthlyReportEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('whatsapp_configs', 'weeklyReportEnabled');
    await queryInterface.removeColumn('whatsapp_configs', 'monthlyReportEnabled');
  }
};
