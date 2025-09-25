'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roleta_premios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'O nome do prêmio que aparece na roleta. Ex: 10% de Desconto',
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Uma descrição mais detalhada do prêmio.',
      },
      probabilidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
        comment: 'Peso da probabilidade. Um item com peso 20 tem o dobro de chance de um com peso 10.',
      },
      recompensaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'recompensas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'A recompensa que será usada para gerar o cupom quando este prêmio for ganho.',
      },
      imageUrl: {
        type: Sequelize.STRING,
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('roleta_premios');
  },
};
