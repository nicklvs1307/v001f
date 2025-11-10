'use strict';

const ENUM_NAME = 'enum_campanhas_status';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the 'paused' value to the existing ENUM type in PostgreSQL
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" ADD VALUE 'paused';`);
  },

  down: async (queryInterface, Sequelize) => {
    // Removing a value from an ENUM is a complex and potentially destructive operation in PostgreSQL.
    // It requires recreating the type and rewriting all tables that use it.
    // For this reason, we will not implement a down migration.
    // If you need to revert, you will have to do it manually.
    console.log('Reverting add-paused-to-campanhas-status-enum is not supported and must be done manually.');
    return Promise.resolve();
  }
};