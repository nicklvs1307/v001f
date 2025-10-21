'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('cupons', 'recompensaId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'recompensas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('cupons', 'recompensaId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'recompensas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
};