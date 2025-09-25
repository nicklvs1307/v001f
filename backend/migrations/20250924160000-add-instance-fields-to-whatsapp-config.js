'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('whatsapp_configs', 'instanceName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('whatsapp_configs', 'instanceStatus', {
      type: Sequelize.STRING,
      defaultValue: 'disconnected',
      allowNull: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('whatsapp_configs', 'instanceName');
    await queryInterface.removeColumn('whatsapp_configs', 'instanceStatus');
  }
};
