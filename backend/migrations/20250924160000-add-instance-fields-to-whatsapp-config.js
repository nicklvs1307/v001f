'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('whatsapp_configs')) {
      const tableDescription = await queryInterface.describeTable('whatsapp_configs');
      if (!tableDescription.instanceName) {
        await queryInterface.addColumn('whatsapp_configs', 'instanceName', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
      if (!tableDescription.instanceStatus) {
        await queryInterface.addColumn('whatsapp_configs', 'instanceStatus', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
      if (!tableDescription.instanceQrCode) {
        await queryInterface.addColumn('whatsapp_configs', 'instanceQrCode', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
      }
      if (!tableDescription.instanceWebhookUrl) {
        await queryInterface.addColumn('whatsapp_configs', 'instanceWebhookUrl', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
    }
  }
  ,
  async down (queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('whatsapp_configs')) {
      const tableDescription = await queryInterface.describeTable('whatsapp_configs');
      if (tableDescription.instanceName) {
        await queryInterface.removeColumn('whatsapp_configs', 'instanceName');
      }
      if (tableDescription.instanceStatus) {
        await queryInterface.removeColumn('whatsapp_configs', 'instanceStatus');
      }
      if (tableDescription.instanceQrCode) {
        await queryInterface.removeColumn('whatsapp_configs', 'instanceQrCode');
      }
      if (tableDescription.instanceWebhookUrl) {
        await queryInterface.removeColumn('whatsapp_configs', 'instanceWebhookUrl');
      }
    }
  }
};
