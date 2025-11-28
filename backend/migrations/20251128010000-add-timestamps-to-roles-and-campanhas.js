'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Helper function to add a column if it doesn't exist
      const addColumnIfNotExists = async (tableName, columnName, columnDefinition) => {
        const tableDescription = await queryInterface.describeTable(tableName, { transaction });
        if (!tableDescription[columnName]) {
          console.log(`Adding column ${columnName} to table ${tableName}...`);
          await queryInterface.addColumn(tableName, columnName, columnDefinition, { transaction });
        }
      };

      // Add timestamps to 'roles' table if they don't exist
      await addColumnIfNotExists('roles', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
      await addColumnIfNotExists('roles', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });

      // Add timestamps to 'campanhas' table if they don't exist
      await addColumnIfNotExists('campanhas', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
      await addColumnIfNotExists('campanhas', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // The down migration is tricky as we don't want to remove columns if they were there before.
    // This is intended as a corrective migration, so a down operation might be intentionally left blank
    // or be very specific not to break older states. For safety, we'll only log.
    console.log('This is a corrective migration. No down operation will be performed to avoid data loss.');
  }
};
