'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Primeiro, preenche a coluna 'key' para todos os registros existentes
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const role of roles) {
      const key = role.name.toLowerCase().replace(/\s+/g, '_');
      await queryInterface.sequelize.query(
        `UPDATE roles SET key = :key WHERE id = :id`,
        {
          replacements: { key, id: role.id },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }
    
    // Agora, altera a coluna para não permitir nulos
    await queryInterface.changeColumn('roles', 'key', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('roles', 'key', {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true,
    });
  }
};
