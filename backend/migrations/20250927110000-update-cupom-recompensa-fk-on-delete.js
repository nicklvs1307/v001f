'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Primeiro, removemos a constraint antiga
    await queryInterface.removeConstraint('cupons', 'cupons_recompensaId_fkey');

    // Adicionamos a nova constraint com ON DELETE CASCADE
    await queryInterface.addConstraint('cupons', {
      fields: ['recompensaId'],
      type: 'foreign key',
      name: 'cupons_recompensaId_fkey', // O mesmo nome da constraint antiga
      references: {
        table: 'recompensas',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverte as alterações: remove a constraint com CASCADE
    await queryInterface.removeConstraint('cupons', 'cupons_recompensaId_fkey');

    // E adiciona a constraint original com ON DELETE RESTRICT
    await queryInterface.addConstraint('cupons', {
      fields: ['recompensaId'],
      type: 'foreign key',
      name: 'cupons_recompensaId_fkey',
      references: {
        table: 'recompensas',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  }
};
