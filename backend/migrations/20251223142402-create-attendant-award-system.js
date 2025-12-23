'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // --- Alterações na tabela 'atendente_metas' ---
      await queryInterface.addColumn('atendente_metas', 'period', {
        type: Sequelize.ENUM('DIARIO', 'SEMANAL', 'MENSAL'),
        allowNull: false,
        defaultValue: 'MENSAL'
      }, { transaction });

      await queryInterface.addColumn('atendente_metas', 'dias_trabalhados', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 22
      }, { transaction });

      await queryInterface.addColumn('atendente_metas', 'nps_premio_valor', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('atendente_metas', 'respostas_premio_valor', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });
      
      await queryInterface.addColumn('atendente_metas', 'cadastros_premio_valor', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });

      // --- Criação da tabela 'atendente_premiacoes' ---
      await queryInterface.createTable('atendente_premiacoes', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        tenantId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'tenants', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        atendenteId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'atendentes', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        atendenteMetaId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'atendente_metas', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        descricao_premio: {
          type: Sequelize.STRING,
          allowNull: false
        },
        valor_premio: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
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
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('atendente_premiacoes', { transaction });
      await queryInterface.removeColumn('atendente_metas', 'period', { transaction });
      await queryInterface.removeColumn('atendente_metas', 'dias_trabalhados', { transaction });
      await queryInterface.removeColumn('atendente_metas', 'nps_premio_valor', { transaction });
      await queryInterface.removeColumn('atendente_metas', 'respostas_premio_valor', { transaction });
      await queryInterface.removeColumn('atendente_metas', 'cadastros_premio_valor', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};