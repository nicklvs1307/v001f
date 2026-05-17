'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('roleta_premios', 'estoqueMaximo', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('roleta_premios', 'estoqueResetTipo', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'nunca',
    });

    await queryInterface.addColumn('roleta_premios', 'cooldownGiros', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('roleta_premios', 'estoqueMaximo');
    await queryInterface.removeColumn('roleta_premios', 'estoqueResetTipo');
    await queryInterface.removeColumn('roleta_premios', 'cooldownGiros');
  },
};
