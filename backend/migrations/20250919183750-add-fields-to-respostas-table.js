'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('respostas');
    if (!tableDescription.respondentSessionId) {
      await queryInterface.addColumn('respostas', 'respondentSessionId', {
        type: Sequelize.STRING,
        allowNull: false,
      });
    }
    if (!tableDescription.ratingValue) {
      await queryInterface.addColumn('respostas', 'ratingValue', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!tableDescription.textValue) {
      await queryInterface.addColumn('respostas', 'textValue', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!tableDescription.selectedOption) {
      await queryInterface.addColumn('respostas', 'selectedOption', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (tableDescription.value) {
      await queryInterface.removeColumn('respostas', 'value');
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('respostas');
    if (tableDescription.respondentSessionId) {
      await queryInterface.removeColumn('respostas', 'respondentSessionId');
    }
    if (tableDescription.ratingValue) {
      await queryInterface.removeColumn('respostas', 'ratingValue');
    }
    if (tableDescription.textValue) {
      await queryInterface.removeColumn('respostas', 'textValue');
    }
    if (tableDescription.selectedOption) {
      await queryInterface.removeColumn('respostas', 'selectedOption');
    }
    if (!tableDescription.value) {
      await queryInterface.addColumn('respostas', 'value', {
        type: Sequelize.TEXT,
        allowNull: false,
      });
    }
    if (!tableDescription.usuarioId) {
      await queryInterface.addColumn('respostas', 'usuarioId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  }
};
