'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('tenants', 'plan', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'basic', // Novos tenants nascem como Basic
      }, { transaction });

      // GARANTIA DE SEGURANÇA: Atualiza todos os tenants JÁ EXISTENTES para 'pro'
      // para que eles não percam acesso à Roleta e Automações.
      await queryInterface.sequelize.query(
        "UPDATE tenants SET plan = 'pro'", 
        { transaction }
      );

      await queryInterface.addColumn('tenants', 'planExpiresAt', {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('tenants', 'plan', { transaction });
      await queryInterface.removeColumn('tenants', 'planExpiresAt', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};