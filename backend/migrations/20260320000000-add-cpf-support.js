'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adicionar CPF à tabela clients
    await queryInterface.addColumn('clients', 'cpf', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Adicionar índice de unicidade para CPF por Tenant
    await queryInterface.addIndex('clients', ['tenantId', 'cpf'], {
      unique: true,
      name: 'unique_tenant_cpf',
      where: {
        cpf: {
          [Sequelize.Op.ne]: null,
        },
      },
    });

    // Adicionar configurações de CPF à tabela pesquisas
    await queryInterface.addColumn('pesquisas', 'askForCpf', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('pesquisas', 'requireCpf', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índice e coluna de clients
    await queryInterface.removeIndex('clients', 'unique_tenant_cpf');
    await queryInterface.removeColumn('clients', 'cpf');

    // Remover colunas de pesquisas
    await queryInterface.removeColumn('pesquisas', 'askForCpf');
    await queryInterface.removeColumn('pesquisas', 'requireCpf');
  }
};
