'use strict';
const { v4: uuidv4 } = require('uuid');

// UUID Fixo para a campanha do sistema
const SYSTEM_CAMPAIGN_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('campanhas', [{
      id: SYSTEM_CAMPAIGN_ID,
      nome: 'Ações do Sistema',
      tenantId: null, // Campanha global, não pertence a um tenant
      mensagem: 'Esta é uma campanha interna para registrar ações do sistema, como envios de aniversário.',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {
      ignoreDuplicates: true, // No PostgreSQL, pode ser necessário usar um upsert ou verificar a existência antes.
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('campanhas', {
      id: SYSTEM_CAMPAIGN_ID
    });
  }
};
