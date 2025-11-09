'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WhatsappSenders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nome de identificação do número de disparo (ex: Disparador 01)',
      },
      apiUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'URL base da instância da API (ex: http://localhost:8081)',
      },
      apiKey: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'API Key para autenticação na instância',
      },
      instanceName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Nome da instância na API (ex: feedeliza-sender-01)',
      },
      status: {
        type: Sequelize.ENUM('active', 'warming_up', 'resting', 'blocked', 'disconnected'),
        allowNull: false,
        defaultValue: 'disconnected',
        comment: 'Status atual do número de disparo',
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridade de uso (números menores são usados primeiro)',
      },
      dailyLimit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
        comment: 'Limite de mensagens que pode enviar por dia',
      },
      messagesSentToday: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de mensagens enviadas no dia atual',
      },
      lastUsedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data e hora do último uso para fins de rotação',
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WhatsappSenders');
  }
};
