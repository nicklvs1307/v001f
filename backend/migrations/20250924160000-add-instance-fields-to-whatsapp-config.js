'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('whatsappConfigs')) {
      const tableDescription = await queryInterface.describeTable('whatsappConfigs');
      if (!tableDescription.instanceName) {
        await queryInterface.addColumn('whatsappConfigs', 'instanceName', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
      if (!tableDescription.instanceStatus) {
        await queryInterface.addColumn('whatsappConfigs', 'instanceStatus', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
      if (!tableDescription.instanceQrCode) {
        await queryInterface.addColumn('whatsappConfigs', 'instanceQrCode', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
      }
      if (!tableDescription.instanceWebhookUrl) {
        await queryInterface.addColumn('whatsappConfigs', 'instanceWebhookUrl', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
    }
  }
  async down (queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('whatsappConfigs')) {
      const tableDescription = await queryInterface.describeTable('whatsappConfigs');
      if (tableDescription.instanceName) {
        await queryInterface.removeColumn('whatsappConfigs', 'instanceName');
      }
      if (tableDescription.instanceStatus) {
        await queryInterface.removeColumn('whatsappConfigs', 'instanceStatus');
      }
      if (tableDescription.instanceQrCode) {
        await queryInterface.removeColumn('whatsappConfigs', 'instanceQrCode');
      }
      if (tableDescription.instanceWebhookUrl) {
        await queryInterface.removeColumn('whatsappConfigs', 'instanceWebhookUrl');
      }
    }
  }
};
