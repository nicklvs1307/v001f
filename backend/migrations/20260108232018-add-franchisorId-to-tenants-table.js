'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'franchisorId', {
      type: Sequelize.UUID,
      allowNull: true, // Nulo para tenants que não são franqueados
      references: {
        model: 'franchisors', // Nome da tabela de franqueadoras
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Se a franqueadora for deletada, o franqueado se torna um tenant normal
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tenants', 'franchisorId');
  }
};
