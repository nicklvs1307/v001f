'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('respostas');
    if (!tableDescription.atendenteId) {
      await queryInterface.addColumn('respostas', 'atendenteId', {
        type: Sequelize.UUID,
        allowNull: true, // Pode ser nulo se não houver atendente associado
        references: {
          model: 'atendentes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('respostas');
    if (tableDescription.atendenteId) {
      await queryInterface.removeColumn('respostas', 'atendenteId');
    }
  }
};
