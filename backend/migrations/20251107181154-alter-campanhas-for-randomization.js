'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('campanhas', 'messageDelaySeconds', 'minMessageDelaySeconds');
    await queryInterface.addColumn('campanhas', 'maxMessageDelaySeconds', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.changeColumn('campanhas', 'mensagem', {
      type: Sequelize.JSON,
      allowNull: false,
    });
    // Renomear a coluna para refletir o novo tipo de dado
    await queryInterface.renameColumn('campanhas', 'mensagem', 'mensagens');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('campanhas', 'minMessageDelaySeconds', 'messageDelaySeconds');
    await queryInterface.removeColumn('campanhas', 'maxMessageDelaySeconds');
    await queryInterface.renameColumn('campanhas', 'mensagens', 'mensagem');
    await queryInterface.changeColumn('campanhas', 'mensagem', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  }
};
