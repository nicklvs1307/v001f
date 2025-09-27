'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('recompensas');
    if (!tableDescription.type) {
      await queryInterface.addColumn('recompensas', 'type', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableDescription.value) {
      await queryInterface.addColumn('recompensas', 'value', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('recompensas');
    if (tableDescription.type) {
      await queryInterface.removeColumn('recompensas', 'type');
    }
    if (tableDescription.value) {
      await queryInterface.removeColumn('recompensas', 'value');
    }
  }
};
