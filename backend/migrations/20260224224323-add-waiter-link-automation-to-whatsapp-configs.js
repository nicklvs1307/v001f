'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('whatsapp_configs', 'waiterLinkAutomationEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('whatsapp_configs', 'waiterLinkMessageTemplate', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: 'Olá! O novo link da pesquisa é: {{link}}',
    });
    await queryInterface.addColumn('whatsapp_configs', 'waiterLinkPhoneNumbers', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('whatsapp_configs', 'waiterLinkAutomationEnabled');
    await queryInterface.removeColumn('whatsapp_configs', 'waiterLinkMessageTemplate');
    await queryInterface.removeColumn('whatsapp_configs', 'waiterLinkPhoneNumbers');
  }
};
