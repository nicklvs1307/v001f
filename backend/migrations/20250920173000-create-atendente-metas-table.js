'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('atendenteMetas')) {
      await queryInterface.createTable('atendenteMetas', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        atendenteId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'atendentes',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          unique: true, // Um atendente só pode ter uma meta
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
        npsGoal: {
          type: Sequelize.DECIMAL(5, 2), // Ex: 80.50
          allowNull: false,
          defaultValue: 0,
        },
        responsesGoal: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        registrationsGoal: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('atendenteMetas')) {
      await queryInterface.dropTable('atendenteMetas');
    }
  },
};