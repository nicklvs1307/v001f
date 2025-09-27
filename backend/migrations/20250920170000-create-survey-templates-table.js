'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('survey_templates')) {
      await queryInterface.createTable('survey_templates', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        tenantId: {
          type: Sequelize.UUID,
          allowNull: true, // Pode ser nulo para templates globais do sistema
          references: {
            model: 'tenants',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        templateData: {
          type: Sequelize.JSONB,
          allowNull: false, // Armazenará a estrutura das perguntas do template
        },
        type: {
          type: Sequelize.STRING, // Ex: 'NPS', 'CSAT', 'RATINGS'
          allowNull: false,
        },
        targetAudience: {
          type: Sequelize.STRING, // Ex: 'Delivery', 'Salão', 'Geral'
          allowNull: true,
        },
        isSystemTemplate: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
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
    if (tables.includes('survey_templates')) {
      await queryInterface.dropTable('survey_templates');
    }
  },
};