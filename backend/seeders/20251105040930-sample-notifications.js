'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // IMPORTANT: Replace userId and tenantId with actual IDs from your database.
    const userId = 1; // Example user ID
    const tenantId = 1; // Example tenant ID

    await queryInterface.bulkInsert('notifications', [
      {
        type: 'NEW_USER',
        message: 'Novo usuário cadastrado: João Silva',
        read: false,
        userId: userId,
        tenantId: tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'COUPON_USED',
        message: 'Cupom "DESCONTO10" utilizado por Maria Souza.',
        read: false,
        userId: userId,
        tenantId: tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'SURVEY_RESPONSE',
        message: 'Nova resposta de pesquisa recebida.',
        read: true,
        userId: userId,
        tenantId: tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('notifications', null, {});
  }
};