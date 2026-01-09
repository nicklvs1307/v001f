'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('roles', 'key', {
      type: Sequelize.STRING(100),
      allowNull: true, // Temporariamente nulo para não quebrar dados existentes
      unique: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('roles', 'key');
  }
};
