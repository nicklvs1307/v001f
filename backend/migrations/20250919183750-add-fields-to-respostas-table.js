'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('respostas', 'respondentSessionId', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('respostas', 'ratingValue', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('respostas', 'textValue', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('respostas', 'selectedOption', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.removeColumn('respostas', 'value');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('respostas', 'respondent_session_id');
    await queryInterface.removeColumn('respostas', 'rating_value');
    await queryInterface.removeColumn('respostas', 'text_value');
    await queryInterface.removeColumn('respostas', 'selected_option');
    await queryInterface.addColumn('respostas', 'value', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.addColumn('respostas', 'usuario_id', {
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
};
