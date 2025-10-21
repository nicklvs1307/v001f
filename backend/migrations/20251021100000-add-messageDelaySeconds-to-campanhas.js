'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Campanhas', 'messageDelaySeconds', {
      type: Sequelize.INTEGER,
      allowNull: true, // Pode ser nulo, mas terá um valor padrão no código
      defaultValue: 0, // Valor padrão de 0 segundos
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Campanhas', 'messageDelaySeconds');
  }
};