'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('roles', 'key', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('roles', 'key', {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true,
    });
  }
};
