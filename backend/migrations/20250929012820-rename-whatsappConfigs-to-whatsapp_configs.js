'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameTable('whatsappConfigs', 'whatsapp_configs');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameTable('whatsapp_configs', 'whatsappConfigs');
  }
};