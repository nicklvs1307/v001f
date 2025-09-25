'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'profilePictureUrl', {
      type: Sequelize.STRING,
      allowNull: true, // Pode ser nulo se o usuário não tiver foto de perfil
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('usuarios', 'profilePictureUrl');
  }
};
