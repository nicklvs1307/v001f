'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const role of roles) {
      const key = role.name.toLowerCase().replace(/\s+/g, '_');
      await queryInterface.sequelize.query(
        `UPDATE roles SET key = '${key}' WHERE id = '${role.id}'`
      );
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `UPDATE roles SET key = NULL`
    );
  }
};
