'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tratativas', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      respondentSessionId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'),
        defaultValue: 'PENDENTE',
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('tratativas', ['respondentSessionId']);
    await queryInterface.addIndex('tratativas', ['tenantId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tratativas');
    // Note: ENUM types might need manual cleanup in some DBs, 
    // but dropTable usually handles it or we can leave it if shared.
  }
};