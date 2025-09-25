'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
      recompensaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'recompensas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      codigo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      clienteId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      dataGeracao: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      dataUtilizacao: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dataValidade: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.DataTypes.ENUM('active', 'used', 'expired', 'pending'),
        defaultValue: 'active',
        allowNull: false,
      },
      ultimoContato: {
        type: Sequelize.DATE,
        allowNull: true,
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cupons');
  },
};