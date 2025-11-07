'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Tenta remover as constraints de unicidade antigas.
      // Envolve em try-catch para não falhar se já foram removidas.
      try {
        await queryInterface.removeConstraint('clients', 'clients_email_key', { transaction });
      } catch (e) {
        console.log("Constraint 'clients_email_key' not found, skipping removal.");
      }
      try {
        await queryInterface.removeConstraint('clients', 'clients_phone_uk', { transaction });
      } catch (e) {
        console.log("Constraint 'clients_phone_uk' not found, skipping removal.");
      }

      // Adicionar os novos índices de unicidade compostos com condição `where` para não incluir nulos
      await queryInterface.addIndex('clients', ['tenantId', 'email'], {
        unique: true,
        name: 'unique_tenant_email',
        where: {
          email: {
            [Sequelize.Op.ne]: null
          }
        },
        transaction
      });
      
      await queryInterface.addIndex('clients', ['tenantId', 'phone'], {
        unique: true,
        name: 'unique_tenant_phone',
        where: {
          phone: {
            [Sequelize.Op.ne]: null
          }
        },
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Error in migration up:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remover os índices de unicidade compostos
      await queryInterface.removeIndex('clients', 'unique_tenant_email', { transaction });
      await queryInterface.removeIndex('clients', 'unique_tenant_phone', { transaction });

      // Adicionar de volta as constraints de unicidade antigas
      await queryInterface.addConstraint('clients', {
        fields: ['email'],
        type: 'unique',
        name: 'clients_email_key',
        transaction,
      });
      await queryInterface.addConstraint('clients', {
        fields: ['phone'],
        type: 'unique',
        name: 'clients_phone_uk',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Error in migration down:', error);
      throw error;
    }
  }
};