'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adicionar recompensaId e period à tabela atendente_metas
    await queryInterface.addColumn('atendente_metas', 'recompensaId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'recompensas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('atendente_metas', 'period', {
      type: Sequelize.ENUM('DIARIO', 'SEMANAL', 'MENSAL'),
      allowNull: false,
      defaultValue: 'MENSAL'
    });

    // Criar a tabela atendente_premiacoes
    await queryInterface.createTable('atendente_premiacoes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      atendenteId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'atendentes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      atendenteMetaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'atendente_metas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      recompensaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'recompensas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      dateAwarded: {
        type: Sequelize.DATE,
        allowNull: false
      },
      metricValueAchieved: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover colunas e dropar a tabela na ordem inversa
    await queryInterface.dropTable('atendente_premiacoes');
    await queryInterface.removeColumn('atendente_metas', 'period');
    await queryInterface.removeColumn('atendente_metas', 'recompensaId');
  }
};