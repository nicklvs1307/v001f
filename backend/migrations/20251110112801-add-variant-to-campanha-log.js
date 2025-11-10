'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CampanhaLogs', 'variant', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Identifies the message variant (e.g., A, B) used for A/B testing.',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('CampanhaLogs', 'variant');
  }
};