'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('respostas', 'pesquisa_id', {
      type: Sequelize.UUID,
      allowNull: true, 
      references: {
        model: 'pesquisas', 
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('respostas', 'pesquisa_id');
  }
};