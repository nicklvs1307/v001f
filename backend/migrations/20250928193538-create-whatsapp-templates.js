'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('whatsapp_templates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Tipo de automação, ex: COUPON_REMINDER'
      },
      isEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      daysBefore: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Para lembretes, dias antes do vencimento.'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'O template da mensagem, com variáveis.'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('whatsapp_templates', ['tenantId', 'type'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('whatsapp_templates');
  },
};