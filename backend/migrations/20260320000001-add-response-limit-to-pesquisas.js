'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pesquisas', 'responseLimit', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0, // 0 significa ilimitado
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('pesquisas', 'responseLimit');
  }
};
