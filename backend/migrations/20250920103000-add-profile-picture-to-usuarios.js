'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('usuarios');
    if (!tableDescription.profilePictureUrl) {
      await queryInterface.addColumn('usuarios', 'profilePictureUrl', {
        type: Sequelize.STRING,
        allowNull: true, // Pode ser nulo se o usuário não tiver foto de perfil
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('usuarios');
    if (tableDescription.profilePictureUrl) {
      await queryInterface.removeColumn('usuarios', 'profilePictureUrl');
    }
  }
};
