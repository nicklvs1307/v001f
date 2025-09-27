
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('criterios')) {
      await queryInterface.createTable('criterios', {
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
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        minValue: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        maxValue: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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

    const perguntasTableDescription = await queryInterface.describeTable('perguntas');
    if (!perguntasTableDescription.criterioId) {
      await queryInterface.addColumn('perguntas', 'criterioId', {
        type: Sequelize.UUID,
        allowNull: true, // Pode ser nulo inicialmente, se nem todas as perguntas tiverem um critério
        references: {
          model: 'criterios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const perguntasTableDescription = await queryInterface.describeTable('perguntas');
    if (perguntasTableDescription.criterioId) {
      await queryInterface.removeColumn('perguntas', 'criterioId');
    }

    const tables = await queryInterface.showAllTables();
    if (tables.includes('criterios')) {
      await queryInterface.dropTable('criterios');
    }
  }
};
