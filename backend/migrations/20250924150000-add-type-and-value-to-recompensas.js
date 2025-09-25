'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('recompensas', 'type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('recompensas', 'value', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('recompensas', 'type');
    await queryInterface.removeColumn('recompensas', 'value');
  }
};
