'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('tenants');
    if (!tableDescription.address) {
      await queryInterface.addColumn('tenants', 'address', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableDescription.phone) {
      await queryInterface.addColumn('tenants', 'phone', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableDescription.email) {
      await queryInterface.addColumn('tenants', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableDescription.logoUrl) {
      await queryInterface.addColumn('tenants', 'logoUrl', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableDescription.primaryColor) {
      await queryInterface.addColumn('tenants', 'primaryColor', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableDescription.secondaryColor) {
      await queryInterface.addColumn('tenants', 'secondaryColor', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableDescription.description) {
      await queryInterface.addColumn('tenants', 'description', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!tableDescription.website) {
      await queryInterface.addColumn('tenants', 'website', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableDescription.cnpj) {
      await queryInterface.addColumn('tenants', 'cnpj', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }
    if (!tableDescription.inscricaoEstadual) {
      await queryInterface.addColumn('tenants', 'inscricaoEstadual', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('tenants');
    if (tableDescription.inscricaoEstadual) {
      await queryInterface.removeColumn('tenants', 'inscricaoEstadual');
    }
    if (tableDescription.cnpj) {
      await queryInterface.removeColumn('tenants', 'cnpj');
    }
    if (tableDescription.website) {
      await queryInterface.removeColumn('tenants', 'website');
    }
    if (tableDescription.description) {
      await queryInterface.removeColumn('tenants', 'description');
    }
    if (tableDescription.secondaryColor) {
      await queryInterface.removeColumn('tenants', 'secondaryColor');
    }
    if (tableDescription.primaryColor) {
      await queryInterface.removeColumn('tenants', 'primaryColor');
    }
    if (tableDescription.logoUrl) {
      await queryInterface.removeColumn('tenants', 'logoUrl');
    }
    if (tableDescription.email) {
      await queryInterface.removeColumn('tenants', 'email');
    }
    if (tableDescription.phone) {
      await queryInterface.removeColumn('tenants', 'phone');
    }
    if (tableDescription.address) {
      await queryInterface.removeColumn('tenants', 'address');
    }
  }
};