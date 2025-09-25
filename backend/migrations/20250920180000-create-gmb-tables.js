'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gmb_configs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
        unique: true, // Um tenant só pode ter uma configuração GMB
      },
      accessToken: {
        type: Sequelize.STRING(1000), // Tokens podem ser longos
        allowNull: false,
      },
      refreshToken: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      locationId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // ID da localização do GMB deve ser único
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

    await queryInterface.createTable('gmb_reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
      gmbReviewId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // ID da avaliação do GMB deve ser único
      },
      reviewerName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      starRating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reviewUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      replyComment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      repliedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('gmb_reviews');
    await queryInterface.dropTable('gmb_configs');
  },
};