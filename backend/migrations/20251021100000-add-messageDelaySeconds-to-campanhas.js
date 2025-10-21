'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('campanhas', 'messageDelaySeconds', {
      type: Sequelize.INTEGER,
      allowNull: true, // Pode ser nulo, mas terá um valor padrão no código
      defaultValue: 0, // Valor padrão de 0 segundos
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('campanhas', 'messageDelaySeconds');
  }
};