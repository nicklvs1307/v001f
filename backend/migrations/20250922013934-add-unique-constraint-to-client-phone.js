'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('clients', {
      fields: ['phone'],
      type: 'unique',
      name: 'clients_phone_uk',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('clients', 'clients_phone_uk');
  }
};
