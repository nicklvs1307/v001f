'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Alterações em WhatsappConfigs
    await queryInterface.addColumn('whatsapp_configs', 'postSaleDelayMinutes', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // 0 significa envio imediato (comportamento atual)
    });
    await queryInterface.addColumn('whatsapp_configs', 'postSaleMessageTemplate', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: 'Olá {{cliente}}! Agradecemos o seu pedido. Poderia nos dar um feedback rápido para melhorarmos? {{link_pesquisa}}',
    });
    await queryInterface.addColumn('whatsapp_configs', 'postSaleSurveyId', {
      type: Sequelize.UUID,
      allowNull: true, // Se null, usa a pesquisa padrão
      references: {
        model: 'pesquisas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 2. Alterações em DeliveryOrders
    await queryInterface.addColumn('delivery_orders', 'surveyStatus', {
      type: Sequelize.STRING, // 'PENDING', 'SCHEDULED', 'SENT', 'ERROR', 'SKIPPED'
      allowNull: false,
      defaultValue: 'PENDING',
    });
    await queryInterface.addColumn('delivery_orders', 'surveyScheduledAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('delivery_orders', 'surveySentAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter WhatsappConfigs
    await queryInterface.removeColumn('whatsapp_configs', 'postSaleDelayMinutes');
    await queryInterface.removeColumn('whatsapp_configs', 'postSaleMessageTemplate');
    await queryInterface.removeColumn('whatsapp_configs', 'postSaleSurveyId');

    // Reverter DeliveryOrders
    await queryInterface.removeColumn('delivery_orders', 'surveyStatus');
    await queryInterface.removeColumn('delivery_orders', 'surveyScheduledAt');
    await queryInterface.removeColumn('delivery_orders', 'surveySentAt');
  }
};
