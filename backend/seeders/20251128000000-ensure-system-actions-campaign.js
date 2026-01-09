'use strict';
const { v4: uuidv4 } = require('uuid');

// UUID Fixo para a campanha do sistema
const SYSTEM_CAMPAIGN_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifica se a campanha do sistema já existe
    const existingCampaign = await queryInterface.sequelize.query(
      `SELECT id FROM campanhas WHERE id = :id`,
      {
        replacements: { id: SYSTEM_CAMPAIGN_ID },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    // Se não existir, insere. Isso evita o erro de "ignoreDuplicates" que não funciona bem no Postgres com bulkInsert
    if (existingCampaign.length === 0) {
      await queryInterface.bulkInsert('campanhas', [{
        id: SYSTEM_CAMPAIGN_ID,
        nome: 'Ações do Sistema',
        tenantId: null, // Campanha global, não pertence a um tenant
        mensagens: JSON.stringify([{ content: 'Esta é uma campanha interna para registrar ações do sistema, como envios de aniversário.' }]),
        rewardType: 'none',
        recompensaId: null,
        roletaId: null,
        dataValidade: new Date('2099-12-31'),
        criterioSelecao: JSON.stringify({ type: 'system' }),
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('campanhas', {
      id: SYSTEM_CAMPAIGN_ID
    });
  }
};
