'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Esta migração foi substituída pela '20251107191331-fix-campaigns-table-state.js'
    // que é idempotente. Esta função é deixada em branco para evitar erros
    // em bancos de dados onde a migração pode ter sido executada parcialmente.
    return Promise.resolve();
  },

  async down (queryInterface, Sequelize) {
    // A migração de correção '20251107191331-fix-campaigns-table-state.js'
    // cuidará da reversão do estado, se necessário.
    return Promise.resolve();
  }
};
