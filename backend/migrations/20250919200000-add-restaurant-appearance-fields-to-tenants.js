'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'address', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'logoUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'primaryColor', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'secondaryColor', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'website', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'cnpj', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('tenants', 'inscricaoEstadual', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tenants', 'inscricao_estadual');
    await queryInterface.removeColumn('tenants', 'cnpj');
    await queryInterface.removeColumn('tenants', 'website');
    await queryInterface.removeColumn('tenants', 'description');
    await queryInterface.removeColumn('tenants', 'secondary_color');
    await queryInterface.removeColumn('tenants', 'primary_color');
    await queryInterface.removeColumn('tenants', 'logo_url');
    await queryInterface.removeColumn('tenants', 'email_contato');
    await queryInterface.removeColumn('tenants', 'phone');
    await queryInterface.removeColumn('tenants', 'address');
  }
};