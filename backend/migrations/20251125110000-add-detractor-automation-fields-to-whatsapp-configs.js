'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('whatsapp_configs', 'sendDetractorMessageToClient', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('whatsapp_configs', 'detractorMessageTemplate', {
      type: Sequelize.TEXT,
      defaultValue: 'Olá, {{cliente}}. Vimos que você teve um problema conosco e gostaríamos de entender melhor. Podemos ajudar de alguma forma?',
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('whatsapp_configs', 'sendDetractorMessageToClient');
    await queryInterface.removeColumn('whatsapp_configs', 'detractorMessageTemplate');
  }
};
