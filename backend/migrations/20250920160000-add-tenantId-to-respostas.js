'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('respostas');
    if (!tableDescription.tenantId) {
      await queryInterface.addColumn('respostas', 'tenantId', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('respostas');
    if (tableDescription.tenantId) {
      await queryInterface.removeColumn('respostas', 'tenantId');
    }
  }
};
