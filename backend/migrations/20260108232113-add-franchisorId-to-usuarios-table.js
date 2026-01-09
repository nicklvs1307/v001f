'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'franchisorId', {
      type: Sequelize.UUID,
      allowNull: true, // Nulo para usuários que não são de uma franqueadora
      references: {
        model: 'franchisors', // Nome da tabela de franqueadoras
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Se a franqueadora for deletada, o usuário perde o vínculo mas não é deletado
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'franchisorId');
  }
};
