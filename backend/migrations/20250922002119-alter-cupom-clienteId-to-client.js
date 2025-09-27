'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // 1. Remover a chave estrangeira existente que aponta para a tabela 'usuarios'
      await queryInterface.removeConstraint('cupons', 'cupons_clienteId_fkey');
    } catch (e) {
      if (e.parent && e.parent.code === '42704') { // undefined_object
        console.log('Constraint cupons_clienteId_fkey não existe, pulando remoção.');
      } else {
        throw e;
      }
    }

    try {
      // 2. Adicionar a nova chave estrangeira que aponta para a tabela 'clients'
      await queryInterface.addConstraint('cupons', {
        fields: ['clienteId'],
        type: 'foreign key',
        name: 'cupons_clienteId_fkey', // Pode ser o mesmo nome ou um novo
        references: {
          table: 'clients',
          field: 'id',
        },
        onDelete: 'SET NULL', // Ou 'CASCADE', dependendo da regra de negócio
        onUpdate: 'CASCADE',
      });
    } catch (e) {
      if (e.parent && e.parent.code === '42710') { // duplicate_object
        console.log('Constraint cupons_clienteId_fkey já aponta para clients, pulando adição.');
      } else {
        throw e;
      }
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      // 1. Remover a chave estrangeira que aponta para a tabela 'clients'
      await queryInterface.removeConstraint('cupons', 'cupons_clienteId_fkey');
    } catch (e) {
      if (e.parent && e.parent.code === '42704') { // undefined_object
        console.log('Constraint cupons_clienteId_fkey não existe, pulando remoção.');
      } else {
        throw e;
      }
    }

    try {
      // 2. Adicionar de volta a chave estrangeira que aponta para a tabela 'usuarios'
      await queryInterface.addConstraint('cupons', {
        fields: ['clienteId'],
        type: 'foreign key',
        name: 'cupons_clienteId_fkey',
        references: {
          table: 'usuarios',
          field: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    } catch (e) {
      if (e.parent && e.parent.code === '42710') { // duplicate_object
        console.log('Constraint cupons_clienteId_fkey já aponta para usuarios, pulando adição.');
      } else {
        throw e;
      }
    }
  }
};
