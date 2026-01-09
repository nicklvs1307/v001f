'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      orderIdPlatform: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      orderDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Adicionar a constraint única composta para platform e orderIdPlatform
    await queryInterface.addConstraint('delivery_orders', {
      fields: ['platform', 'orderIdPlatform'],
      type: 'unique',
      name: 'unique_platform_orderId_idx',
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover a constraint antes de dropar a tabela
    await queryInterface.removeConstraint('delivery_orders', 'unique_platform_orderId_idx');
    await queryInterface.dropTable('delivery_orders');
  }
};
