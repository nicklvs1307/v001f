'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'ifoodMerchantId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('tenants', 'ifoodAccessToken', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'ifoodRefreshToken', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'ifoodTokenExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tenants', 'ifoodMerchantId');
    await queryInterface.removeColumn('tenants', 'ifoodAccessToken');
    await queryInterface.removeColumn('tenants', 'ifoodRefreshToken');
    await queryInterface.removeColumn('tenants', 'ifoodTokenExpiresAt');
  }
};