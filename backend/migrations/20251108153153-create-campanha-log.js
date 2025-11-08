'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CampanhaLogs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      campanhaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'campanhas',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      clienteId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
        onDelete: 'SET NULL', // Ou CASCADE, dependendo da regra de negócio
      },
      status: {
        type: Sequelize.ENUM('sent', 'failed', 'skipped'),
        allowNull: false,
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CampanhaLogs');
  }
};