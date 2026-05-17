'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RoletaSpinLog extends Model {
    static associate(models) {
      RoletaSpinLog.belongsTo(models.Tenant, {
        foreignKey: 'tenantId',
        as: 'tenant',
      });
      RoletaSpinLog.belongsTo(models.Roleta, {
        foreignKey: 'roletaId',
        as: 'roleta',
      });
      RoletaSpinLog.belongsTo(models.RoletaPremio, {
        foreignKey: 'premioId',
        as: 'premio',
      });
      RoletaSpinLog.belongsTo(models.Client, {
        foreignKey: 'clienteId',
        as: 'client',
      });
    }
  }

  RoletaSpinLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roletaId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    premioId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    clienteId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'RoletaSpinLog',
    tableName: 'roleta_spin_logs',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  return RoletaSpinLog;
};
