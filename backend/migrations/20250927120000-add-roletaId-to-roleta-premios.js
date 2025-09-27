'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('roleta_premios', 'roletaId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'roletas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('roleta_premios', 'roletaId');
  }
};
