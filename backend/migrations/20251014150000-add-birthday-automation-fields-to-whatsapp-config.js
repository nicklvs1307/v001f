'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'whatsapp_configs',
      'birthdayAutomationEnabled',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    );
    await queryInterface.addColumn(
      'whatsapp_configs',
      'birthdayMessageTemplate',
      {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: 'Feliz aniversário, {{cliente}}! Ganhe {{recompensa}} com o cupom {{cupom}}.',
      }
    );
    await queryInterface.addColumn(
      'whatsapp_configs',
      'birthdayDaysBefore',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    );
    await queryInterface.addColumn(
      'whatsapp_configs',
      'birthdayRewardType',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'whatsapp_configs',
      'birthdayRewardId',
      {
        type: Sequelize.UUID,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'whatsapp_configs',
      'birthdayCouponValidityDays',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('whatsapp_configs', 'birthdayAutomationEnabled');
    await queryInterface.removeColumn('whatsapp_configs', 'birthdayMessageTemplate');
    await queryInterface.removeColumn('whatsapp_configs', 'birthdayDaysBefore');
    await queryInterface.removeColumn('whatsapp_configs', 'birthdayRewardType');
    await queryInterface.removeColumn('whatsapp_configs', 'birthdayRewardId');
    await queryInterface.removeColumn('whatsapp_configs', 'birthdayCouponValidityDays');
  }
};
