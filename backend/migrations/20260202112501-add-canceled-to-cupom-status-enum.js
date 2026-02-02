'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adiciona 'canceled' ao enum existente no banco de dados Postgres
    // O comando ALTER TYPE ... ADD VALUE só funciona no Postgres.
    // Se estiver usando MySQL, seria um ALTER TABLE MODIFY COLUMN...
    try {
      await queryInterface.sequelize.query("ALTER TYPE enum_cupons_status ADD VALUE 'canceled';");
    } catch (e) {
      // Se o valor já existir, o Postgres lança um erro. Podemos ignorar ou tratar.
      console.log("Erro ao adicionar valor ao enum (pode já existir):", e.message);
    }
  },

  async down (queryInterface, Sequelize) {
    // Postgres não suporta remover valores de ENUM facilmente sem recriar o tipo.
    // Geralmente em migrations 'down' de adição de valor enum, nós não fazemos nada
    // ou teríamos que recriar o tipo inteiro, o que é arriscado para dados existentes.
    console.log("Reverter adição de valor em ENUM não é suportado nativamente de forma segura.");
  }
};