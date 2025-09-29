'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('whatsapp_configs', 'instanceName', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('whatsapp_configs', 'instanceStatus', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'disconnected'
      }),
      queryInterface.addColumn('whatsapp_configs', 'instanceQrCode', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
      queryInterface.addColumn('whatsapp_configs', 'instanceWebhookUrl', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  async down (queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.removeColumn('whatsapp_configs', 'instanceName'),
      queryInterface.removeColumn('whatsapp_configs', 'instanceStatus'),
      queryInterface.removeColumn('whatsapp_configs', 'instanceQrCode'),
      queryInterface.removeColumn('whatsapp_configs', 'instanceWebhookUrl'),
    ]);
  }
};