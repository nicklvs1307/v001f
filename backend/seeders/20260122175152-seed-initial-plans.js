'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const plans = [
      {
        id: uuidv4(),
        name: 'Básico',
        price: 97.00,
        description: 'Ideal para quem está começando.',
        active: true,
        features: JSON.stringify({
          maxUsers: 2,
          maxCampaignsPerMonth: 1,
          canUseRoulette: false,
          canUseWhatsappAutomation: false,
          canUseFranchisor: false,
          canRemoveBranding: false
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Profissional',
        price: 197.00,
        description: 'Para negócios em crescimento que precisam de automação.',
        active: true,
        features: JSON.stringify({
          maxUsers: 5,
          maxCampaignsPerMonth: 10,
          canUseRoulette: true,
          canUseWhatsappAutomation: true,
          canUseFranchisor: false,
          canRemoveBranding: false
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Enterprise',
        price: 497.00,
        description: 'Controle total e múltiplas lojas.',
        active: true,
        features: JSON.stringify({
          maxUsers: 999,
          maxCampaignsPerMonth: 9999,
          canUseRoulette: true,
          canUseWhatsappAutomation: true,
          canUseFranchisor: true,
          canRemoveBranding: true
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Verificar se já existem planos para evitar duplicidade em re-runs
    const existingPlans = await queryInterface.rawSelect('plans', {
      where: { name: 'Profissional' },
    }, ['id']);

    if (!existingPlans) {
       await queryInterface.bulkInsert('plans', plans, {});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('plans', null, {});
  }
};