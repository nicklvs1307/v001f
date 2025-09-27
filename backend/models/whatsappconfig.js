'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WhatsappConfig extends Model {
    static associate(models) {
      WhatsappConfig.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    }
  }
  WhatsappConfig.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    url: DataTypes.STRING,
    apiKey: DataTypes.STRING,
    instanceName: DataTypes.STRING,
    instanceStatus: {
      type: DataTypes.STRING,
      defaultValue: 'disconnected'
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'WhatsappConfig',
    tableName: 'whatsappConfigs',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return WhatsappConfig;
};