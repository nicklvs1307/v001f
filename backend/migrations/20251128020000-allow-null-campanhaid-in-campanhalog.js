'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('CampanhaLogs', 'campanhaId', {
      type: Sequelize.UUID,
      allowNull: true, // Permitir nulo
      references: {
        model: 'campanhas',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter para não permitir nulo pode ser problemático se houver dados nulos.
    // É mais seguro garantir que não há nulos antes de reverter.
    await queryInterface.changeColumn('CampanhaLogs', 'campanhaId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'campanhas',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  }
};
