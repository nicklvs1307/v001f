'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Replica extends Model {
    static associate(models) {
      Replica.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      // Association with Client/Resposta via respondentSessionId if needed for complex queries
    }
  }
  Replica.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    respondentSessionId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Replica',
    tableName: 'replicas',
    timestamps: true,
  });
  return Replica;
};
