'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('whatsapp_configs', 'dailyReportEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('whatsapp_configs', 'reportPhoneNumbers', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('whatsapp_configs', 'dailyReportEnabled');
    await queryInterface.removeColumn('whatsapp_configs', 'reportPhoneNumbers');
  }
};