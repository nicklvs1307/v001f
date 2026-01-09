'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'uairangoEstablishmentId', {
      type: Sequelize.STRING,
      allowNull: true, // Permitir nulo para não quebrar registros existentes
      unique: true, // Garante que cada ID de estabelecimento Uai Rango seja único entre os tenants
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tenants', 'uairangoEstablishmentId');
  }
};
