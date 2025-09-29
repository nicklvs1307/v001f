'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // First, remove the existing foreign key constraint
    await queryInterface.removeConstraint('pesquisas', 'pesquisas_creatorId_fkey');

    // Then, add the new foreign key constraint with ON DELETE RESTRICT
    await queryInterface.addConstraint('pesquisas', {
      fields: ['creatorId'],
      type: 'foreign key',
      name: 'pesquisas_creatorId_fkey',
      references: {
        table: 'usuarios',
        field: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert the changes
    await queryInterface.removeConstraint('pesquisas', 'pesquisas_creatorId_fkey');

    await queryInterface.addConstraint('pesquisas', {
      fields: ['creatorId'],
      type: 'foreign key',
      name: 'pesquisas_creatorId_fkey',
      references: {
        table: 'usuarios',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
};
