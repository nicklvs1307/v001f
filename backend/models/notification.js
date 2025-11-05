'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Usuario, { foreignKey: 'userId' });
      Notification.belongsTo(models.Tenant, { foreignKey: 'tenantId' });
    }
  }

  Notification.init({
    type: {
      type: DataTypes.ENUM('NEW_USER', 'COUPON_USED', 'ROULETTE_SPIN', 'SURVEY_RESPONSE', 'DETRACTOR_RESPONSE'),
      allowNull: false
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    tenantId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tenants',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications'
  });

  return Notification;
};
