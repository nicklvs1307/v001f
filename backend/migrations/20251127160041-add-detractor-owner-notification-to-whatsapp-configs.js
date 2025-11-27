'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('whatsapp_configs', 'notifyDetractorToOwner', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('whatsapp_configs', 'detractorOwnerMessageTemplate', {
      type: Sequelize.TEXT,
      defaultValue: 'Alerta de Detrator: Cliente {{cliente}} deu a nota {{nota}}. Comentário: {{comentario}}',
      allowNull: true,
    });
    await queryInterface.addColumn('whatsapp_configs', 'detractorOwnerPhoneNumbers', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('whatsapp_configs', 'notifyDetractorToOwner');
    await queryInterface.removeColumn('whatsapp_configs', 'detractorOwnerMessageTemplate');
    await queryInterface.removeColumn('whatsapp_configs', 'detractorOwnerPhoneNumbers');
  }
};