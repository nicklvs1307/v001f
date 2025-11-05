'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PushSubscription extends Model {
    static associate(models) {
      PushSubscription.belongsTo(models.Usuario, { foreignKey: 'userId' });
    }
  }

  PushSubscription.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    subscription: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PushSubscription',
    tableName: 'push_subscriptions'
  });

  return PushSubscription;
};
