'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('respostas');
    if (!tableDescription.clienteId) {
      await queryInterface.addColumn('respostas', 'clienteId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('respostas');
    if (tableDescription.clienteId) {
      await queryInterface.removeColumn('respostas', 'clienteId');
    }
  }
};