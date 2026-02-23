'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pesquisas', 'isLinkExpirable', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('pesquisas', 'linkExpirationHours', {
      type: Sequelize.INTEGER,
      defaultValue: 24,
      allowNull: false,
    });
    await queryInterface.addColumn('pesquisas', 'linkToken', {
      type: Sequelize.UUID,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('pesquisas', 'linkExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Populate existing surveys with a linkToken
    await queryInterface.sequelize.query('UPDATE pesquisas SET "linkToken" = uuid_generate_v4() WHERE "linkToken" IS NULL;');
    
    // Make linkToken NOT NULL after population
    await queryInterface.changeColumn('pesquisas', 'linkToken', {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('pesquisas', 'isLinkExpirable');
    await queryInterface.removeColumn('pesquisas', 'linkExpirationHours');
    await queryInterface.removeColumn('pesquisas', 'linkToken');
    await queryInterface.removeColumn('pesquisas', 'linkExpiresAt');
  }
};
