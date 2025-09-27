'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await queryInterface.addConstraint('clients', {
        fields: ['phone'],
        type: 'unique',
        name: 'clients_phone_uk',
      });
    } catch (e) {
      if (e.parent && e.parent.code === '42710') { // duplicate_object
        console.log('Constraint clients_phone_uk já existe, pulando adição.');
      } else {
        throw e;
      }
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint('clients', 'clients_phone_uk');
    } catch (e) {
      if (e.parent && e.parent.code === '42704') { // undefined_object
        console.log('Constraint clients_phone_uk não existe, pulando remoção.');
      } else {
        throw e;
      }
    }
  }
};
