'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('campanhas')) {
      await queryInterface.createTable('campanhas', {
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
        nome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        mensagem: {
          type: Sequelize.TEXT,
          allowNull: false,
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
        dataValidade: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        criterioSelecao: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('draft', 'processing', 'sent', 'failed'),
          defaultValue: 'draft',
          allowNull: false,
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
    }

    const cuponsTableDescription = await queryInterface.describeTable('cupons');
    if (!cuponsTableDescription.campanhaId) {
      await queryInterface.addColumn('cupons', 'campanhaId', {
        type: Sequelize.UUID,
        allowNull: true, // Permite nulo para cupons criados fora de campanhas
        references: {
          model: 'campanhas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const cuponsTableDescription = await queryInterface.describeTable('cupons');
    if (cuponsTableDescription.campanhaId) {
      await queryInterface.removeColumn('cupons', 'campanhaId');
    }

    const tables = await queryInterface.showAllTables();
    if (tables.includes('campanhas')) {
      await queryInterface.dropTable('campanhas');
    }
  },
};
