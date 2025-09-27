'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('tenants');
    if (!tableDescription.reportPhoneNumber) {
      await queryInterface.addColumn('tenants', 'reportPhoneNumber', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('tenants');
    if (tableDescription.reportPhoneNumber) {
      await queryInterface.removeColumn('tenants', 'reportPhoneNumber');
    }
  }
};
