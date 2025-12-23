'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const addColumnIfNotExists = async (tableName, columnName, definition) => {
        const table = await queryInterface.describeTable(tableName, { transaction });
        if (!table[columnName]) {
          await queryInterface.addColumn(tableName, columnName, definition, { transaction });
        }
      };

      const createTableIfNotExists = async (tableName, definition) => {
        const tables = await queryInterface.showAllTables({ transaction });
        if (!tables.includes(tableName)) {
          await queryInterface.createTable(tableName, definition, { transaction });
        }
      };

      // --- Alterações na tabela 'atendente_metas' ---
      await addColumnIfNotExists('atendente_metas', 'period', {
        type: Sequelize.ENUM('DIARIO', 'SEMANAL', 'MENSAL'),
        allowNull: false,
        defaultValue: 'MENSAL'
      });
      await addColumnIfNotExists('atendente_metas', 'dias_trabalhados', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 22
      });
      await addColumnIfNotExists('atendente_metas', 'nps_premio_valor', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      });
      await addColumnIfNotExists('atendente_metas', 'respostas_premio_valor', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      });
      await addColumnIfNotExists('atendente_metas', 'cadastros_premio_valor', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      });

      // --- Criação da tabela 'atendente_premiacoes' ---
      await createTableIfNotExists('atendente_premiacoes', {
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
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const removeColumnIfExists = async (tableName, columnName) => {
        const table = await queryInterface.describeTable(tableName, { transaction });
        if (table[columnName]) {
          await queryInterface.removeColumn(tableName, columnName, { transaction });
        }
      };

      const dropTableIfExists = async (tableName) => {
        const tables = await queryInterface.showAllTables({ transaction });
        if (tables.includes(tableName)) {
          await queryInterface.dropTable(tableName, { transaction });
        }
      };

      await dropTableIfExists('atendente_premiacoes');
      await removeColumnIfExists('atendente_metas', 'period');
      await removeColumnIfExists('atendente_metas', 'dias_trabalhados');
      await removeColumnIfExists('atendente_metas', 'nps_premio_valor');
      await removeColumnIfExists('atendente_metas', 'respostas_premio_valor');
      await removeColumnIfExists('atendente_metas', 'cadastros_premio_valor');
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};