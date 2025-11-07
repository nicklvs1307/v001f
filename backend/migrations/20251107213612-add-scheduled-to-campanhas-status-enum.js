'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adiciona o valor 'scheduled' ao ENUM 'enum_campanhas_status' se ele não existir.
    // O IF NOT EXISTS é específico do PostgreSQL e torna a operação segura para re-execução.
    await queryInterface.sequelize.query("ALTER TYPE \"enum_campanhas_status\" ADD VALUE IF NOT EXISTS 'scheduled'");
  },

  async down (queryInterface, Sequelize) {
    // Remover um valor de um ENUM é um processo complexo e potencialmente destrutivo
    // no PostgreSQL, pois requer a remoção e recriação do tipo, o que pode
    // afetar tabelas e dados existentes. Portanto, deixamos o 'down' vazio
    // para evitar perda de dados acidental. A remoção manual seria necessária se fosse o caso.
    return Promise.resolve();
  }
};