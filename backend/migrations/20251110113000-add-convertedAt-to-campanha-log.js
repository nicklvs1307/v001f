'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CampanhaLogs', 'convertedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of when the conversion (e.g., coupon usage) happened.',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('CampanhaLogs', 'convertedAt');
  }
};