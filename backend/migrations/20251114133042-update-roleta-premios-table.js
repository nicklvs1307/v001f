'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Renomear 'probabilidade' para 'porcentagem'
      await queryInterface.renameColumn('roleta_premios', 'probabilidade', 'porcentagem', { transaction });

      // Alterar o tipo da coluna 'porcentagem' para FLOAT para suportar casas decimais
      await queryInterface.changeColumn('roleta_premios', 'porcentagem', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      }, { transaction });

      // Adicionar a nova coluna 'cor'
      await queryInterface.addColumn('roleta_premios', 'cor', {
        type: Sequelize.STRING,
        allowNull: true, // Permitir nulo inicialmente para registros existentes
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remover a coluna 'cor'
      await queryInterface.removeColumn('roleta_premios', 'cor', { transaction });

      // Reverter a alteração do tipo da coluna 'porcentagem' para INTEGER
      await queryInterface.changeColumn('roleta_premios', 'porcentagem', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      }, { transaction });

      // Renomear 'porcentagem' de volta para 'probabilidade'
      await queryInterface.renameColumn('roleta_premios', 'porcentagem', 'probabilidade', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};