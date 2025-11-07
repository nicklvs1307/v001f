'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Adiciona as novas colunas em vez de tentar renomear
      await queryInterface.addColumn('campanhas', 'minMessageDelaySeconds', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }, { transaction });
      
      await queryInterface.addColumn('campanhas', 'maxMessageDelaySeconds', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }, { transaction });

      // Converte a coluna 'mensagem' para 'mensagens' do tipo JSON
      await queryInterface.sequelize.query(
        'ALTER TABLE "campanhas" ALTER COLUMN "mensagem" TYPE JSON USING json_build_array("mensagem");',
        { transaction }
      );
      await queryInterface.renameColumn('campanhas', 'mensagem', 'mensagens', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remove as colunas que foram adicionadas
      await queryInterface.removeColumn('campanhas', 'minMessageDelaySeconds', { transaction });
      await queryInterface.removeColumn('campanhas', 'maxMessageDelaySeconds', { transaction });
      
      // Reverte a coluna 'mensagens' para 'mensagem' do tipo TEXT
      await queryInterface.renameColumn('campanhas', 'mensagens', 'mensagem', { transaction });
      await queryInterface.sequelize.query(
        'ALTER TABLE "campanhas" ALTER COLUMN "mensagem" TYPE TEXT USING "mensagem"->>0;',
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
