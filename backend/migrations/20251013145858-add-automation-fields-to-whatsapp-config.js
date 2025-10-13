'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('whatsapp_configs', 'sendPrizeMessage', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('whatsapp_configs', 'prizeMessageTemplate', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: 'Parabéns, {{cliente}}! Você ganhou um prêmio: {{premio}}. Use o cupom {{cupom}} para resgatar.',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('whatsapp_configs', 'sendPrizeMessage');
    await queryInterface.removeColumn('whatsapp_configs', 'prizeMessageTemplate');
  }
};