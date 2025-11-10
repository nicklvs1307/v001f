'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('WhatsappSenders', 'warmingUpDay', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Tracks the day number for the warming up process (1 to 7).',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('WhatsappSenders', 'warmingUpDay');
  }
};