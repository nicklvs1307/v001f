'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('campanhas', 'rewardType', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'RECOMPENSA',
      comment: 'Define o tipo de recompensa da campanha: RECOMPENSA ou ROLETA'
    });

    await queryInterface.addColumn('campanhas', 'roletaId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'roletas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('campanhas', 'recompensaId', {
      type: Sequelize.UUID,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('campanhas', 'rewardType');
    await queryInterface.removeColumn('campanhas', 'roletaId');
    await queryInterface.changeColumn('campanhas', 'recompensaId', {
      type: Sequelize.UUID,
      allowNull: false
    });
  }
};