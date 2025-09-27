'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pesquisas', 'recompensaId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'recompensas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('pesquisas', 'roletaId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'roletas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('pesquisas', 'recompensaId');
    await queryInterface.removeColumn('pesquisas', 'roletaId');
  }
};
