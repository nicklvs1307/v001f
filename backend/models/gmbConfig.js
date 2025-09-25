'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GmbConfig extends Model {
    static associate(models) {
      GmbConfig.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    }
  }
  GmbConfig.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    accessToken: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    locationId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    sequelize,
    modelName: 'GmbConfig',
    tableName: 'gmb_configs',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return GmbConfig;
};
