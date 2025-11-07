'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.renameColumn('campanhas', 'messageDelaySeconds', 'minMessageDelaySeconds', { transaction });
      await queryInterface.addColumn('campanhas', 'maxMessageDelaySeconds', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }, { transaction });

      // Passo 1: Alterar o tipo da coluna 'mensagem' para JSON, convertendo o texto existente em um array JSON
      // A query `json_build_array` garante que o texto seja colocado dentro de um array JSON, ex: 'texto' -> ['texto']
      await queryInterface.sequelize.query(
        'ALTER TABLE "campanhas" ALTER COLUMN "mensagem" TYPE JSON USING json_build_array("mensagem");',
        { transaction }
      );

      // Passo 2: Renomear a coluna para 'mensagens'
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
      await queryInterface.renameColumn('campanhas', 'minMessageDelaySeconds', 'messageDelaySeconds', { transaction });
      await queryInterface.removeColumn('campanhas', 'maxMessageDelaySeconds', { transaction });
      
      // Passo 1: Renomear a coluna de volta para 'mensagem'
      await queryInterface.renameColumn('campanhas', 'mensagens', 'mensagem', { transaction });

      // Passo 2: Alterar o tipo de volta para TEXT, extraindo o primeiro elemento do array JSON
      // A expressão `->"mensagens"->>0` extrai o primeiro elemento do array como texto
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
