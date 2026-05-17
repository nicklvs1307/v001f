'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roleta_spin_logs', {
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
      roletaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'roletas', key: 'id' },
        onDelete: 'CASCADE',
      },
      premioId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'roleta_premios', key: 'id' },
        onDelete: 'CASCADE',
      },
      clienteId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'clients', key: 'id' },
        onDelete: 'SET NULL',
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

    await queryInterface.addIndex('roleta_spin_logs', ['tenantId', 'roletaId', 'premioId'], {
      name: 'idx_spin_logs_tenant_roleta_premio',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('roleta_spin_logs');
  },
};
