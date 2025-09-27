'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('roles');
    if (!tableDescription.description) {
      await queryInterface.addColumn('roles', 'description', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!tableDescription.isSystemRole) {
      await queryInterface.addColumn('roles', 'isSystemRole', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('roles');
    if (tableDescription.description) {
      await queryInterface.removeColumn('roles', 'description');
    }
    if (tableDescription.isSystemRole) {
      await queryInterface.removeColumn('roles', 'isSystemRole');
    }
  }
};
