'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tenants', 'deliveryMuchClientId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'deliveryMuchClientSecret', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'deliveryMuchUsername', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'deliveryMuchPassword', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'deliveryMuchToken', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'deliveryMuchTokenExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tenants', 'deliveryMuchClientId');
    await queryInterface.removeColumn('tenants', 'deliveryMuchClientSecret');
    await queryInterface.removeColumn('tenants', 'deliveryMuchUsername');
    await queryInterface.removeColumn('tenants', 'deliveryMuchPassword');
    await queryInterface.removeColumn('tenants', 'deliveryMuchToken');
    await queryInterface.removeColumn('tenants', 'deliveryMuchTokenExpiresAt');
  }
};
