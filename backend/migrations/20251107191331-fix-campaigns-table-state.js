'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableDescription = await queryInterface.describeTable('campanhas');

      // Adiciona minMessageDelaySeconds se não existir
      if (!tableDescription.minMessageDelaySeconds) {
        await queryInterface.addColumn('campanhas', 'minMessageDelaySeconds', {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        }, { transaction });
      }

      // Adiciona maxMessageDelaySeconds se não existir
      if (!tableDescription.maxMessageDelaySeconds) {
        await queryInterface.addColumn('campanhas', 'maxMessageDelaySeconds', {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        }, { transaction });
      }

      // Converte 'mensagem' para 'mensagens' (JSON) se 'mensagem' existir
      if (tableDescription.mensagem) {
        await queryInterface.sequelize.query(
          'ALTER TABLE "campanhas" ALTER COLUMN "mensagem" TYPE JSON USING json_build_array("mensagem");',
          { transaction }
        );
        await queryInterface.renameColumn('campanhas', 'mensagem', 'mensagens', { transaction });
      }

      // Remove a coluna antiga 'messageDelaySeconds' se ela existir
      if (tableDescription.messageDelaySeconds) {
        await queryInterface.removeColumn('campanhas', 'messageDelaySeconds', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableDescription = await queryInterface.describeTable('campanhas');

      // Adiciona a coluna 'messageDelaySeconds' de volta se não existir
      if (!tableDescription.messageDelaySeconds) {
        await queryInterface.addColumn('campanhas', 'messageDelaySeconds', {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        }, { transaction });
      }

      // Remove as colunas novas se existirem
      if (tableDescription.minMessageDelaySeconds) {
        await queryInterface.removeColumn('campanhas', 'minMessageDelaySeconds', { transaction });
      }
      if (tableDescription.maxMessageDelaySeconds) {
        await queryInterface.removeColumn('campanhas', 'maxMessageDelaySeconds', { transaction });
      }

      // Reverte 'mensagens' para 'mensagem' (TEXT) se 'mensagens' existir
      if (tableDescription.mensagens) {
        await queryInterface.renameColumn('campanhas', 'mensagens', 'mensagem', { transaction });
        await queryInterface.sequelize.query(
          'ALTER TABLE "campanhas" ALTER COLUMN "mensagem" TYPE TEXT USING "mensagem"->>0;',
          { transaction }
        );
      }
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
