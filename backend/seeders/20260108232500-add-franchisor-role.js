'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('roles', [{
        id: uuidv4(),
        name: 'Franqueador',
        key: 'franqueador',
        description: 'Usuário que gerencia uma rede de franqueados (tenants).',
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction, ignoreDuplicates: true });

      await transaction.commit();
      console.log('Seeder para o papel de Franqueador executado com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao executar o seeder de Franqueador:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('roles', { name: 'Franqueador' }, { transaction });
      await transaction.commit();
      console.log('Seeder para o papel de Franqueador revertido com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao reverter o seeder de Franqueador:', error);
      throw error;
    }
  }
};
