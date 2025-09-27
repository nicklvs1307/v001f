'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar as permissões de update e delete para o módulo de atendentes
    await queryInterface.bulkInsert('permissoes', [
      {
        id: uuidv4(),
        module: 'atendentes',
        action: 'update',
        description: 'Editar atendentes',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        module: 'atendentes',
        action: 'delete',
        description: 'Excluir atendentes',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Corrigir a descrição da permissão de create
    await queryInterface.bulkUpdate('permissoes', 
      { description: 'Criar atendentes' },
      { module: 'atendentes', action: 'create' }
    );
  },

  async down(queryInterface, Sequelize) {
    // Remover as permissões de update e delete
    await queryInterface.bulkDelete('permissoes', {
      module: 'atendentes',
      action: {
        [Sequelize.Op.in]: ['update', 'delete'],
      },
    });

    // Reverter a descrição da permissão de create
    await queryInterface.bulkUpdate('permissoes', 
      { description: 'Criar/Editar atendentes' },
      { module: 'atendentes', action: 'create' }
    );
  },
};
