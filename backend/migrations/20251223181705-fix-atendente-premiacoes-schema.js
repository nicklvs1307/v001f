'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableDescription = await queryInterface.describeTable('atendente_premiacoes', { transaction });

      // Se a coluna 'descricao_premio' NÃO existe, o schema é o antigo.
      if (!tableDescription.descricao_premio) {
        console.log("Schema antigo detectado. Atualizando tabela 'atendente_premiacoes'...");

        await queryInterface.addColumn('atendente_premiacoes', 'descricao_premio', {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Prêmio não descrito' // Default para não quebrar registros existentes
        }, { transaction });

        await queryInterface.addColumn('atendente_premiacoes', 'valor_premio', {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.00 // Default para não quebrar registros existentes
        }, { transaction });
        
        // A migração antiga criava recompensaId com allowNull: false, mas isso pode dar problema
        // se a tabela 'recompensas' não existir mais da mesma forma.
        // Como o objetivo é remover, vamos apenas remover sem nos preocupar com a FK.
        if (tableDescription.recompensaId) {
             await queryInterface.removeColumn('atendente_premiacoes', 'recompensaId', { transaction });
        }
       
        // Altera o default value para ser nulo depois da migração, se necessário
        await queryInterface.changeColumn('atendente_premiacoes', 'descricao_premio', {
            type: Sequelize.STRING,
            allowNull: false
        }, { transaction });

        await queryInterface.changeColumn('atendente_premiacoes', 'valor_premio', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        }, { transaction });

        console.log("Tabela 'atendente_premiacoes' atualizada com sucesso.");
      } else {
        console.log("Schema da tabela 'atendente_premiacoes' já está atualizado. Nenhuma ação necessária.");
      }
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error("Erro ao migrar o schema de 'atendente_premiacoes':", err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableDescription = await queryInterface.describeTable('atendente_premiacoes', { transaction });

      // Se a coluna 'descricao_premio' EXISTE, podemos reverter para o schema antigo.
      if (tableDescription.descricao_premio) {
        console.log("Revertendo schema da tabela 'atendente_premiacoes' para o estado antigo...");
        
        await queryInterface.removeColumn('atendente_premiacoes', 'descricao_premio', { transaction });
        await queryInterface.removeColumn('atendente_premiacoes', 'valor_premio', { transaction });
        
        await queryInterface.addColumn('atendente_premiacoes', 'recompensaId', {
          type: Sequelize.UUID,
          allowNull: true, // Usar true para evitar erros de FK em dados existentes
          references: {
            model: 'recompensas',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });
        console.log("Schema da tabela 'atendente_premiacoes' revertido com sucesso.");
      } else {
         console.log("Schema da tabela 'atendente_premiacoes' já está no estado antigo. Nenhuma ação necessária.");
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error("Erro ao reverter o schema de 'atendente_premiacoes':", err);
      throw err;
    }
  }
};
