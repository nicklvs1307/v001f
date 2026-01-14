'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'ifoodClientId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'ifoodClientSecret', {
      type: Sequelize.STRING(2048), // Pode ser um segredo longo
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tenants', 'ifoodClientId');
    await queryInterface.removeColumn('tenants', 'ifoodClientSecret');
  }
};