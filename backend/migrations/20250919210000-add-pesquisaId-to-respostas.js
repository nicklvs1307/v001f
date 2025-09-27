'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('respostas');
    if (!tableDescription.pesquisaId) {
      await queryInterface.addColumn('respostas', 'pesquisaId', {
        type: Sequelize.UUID,
        allowNull: true, 
        references: {
          model: 'pesquisas', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', 
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('respostas');
    if (tableDescription.pesquisaId) {
      await queryInterface.removeColumn('respostas', 'pesquisaId');
    }
  }
};