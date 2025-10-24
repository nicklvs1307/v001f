'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('roleta_premios', 'recompensaId', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('roleta_premios', 'recompensaId', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  }
};
