'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ImpersonationLog extends Model {
    static associate(models) {
      ImpersonationLog.belongsTo(models.Usuario, {
        foreignKey: 'superAdminId',
        as: 'superAdmin',
      });
      ImpersonationLog.belongsTo(models.Usuario, {
        foreignKey: 'impersonatedUserId',
        as: 'impersonatedUser',
      });
      ImpersonationLog.belongsTo(models.Tenant, {
        foreignKey: 'tenantId',
        as: 'tenant',
      });
    }
  }
  ImpersonationLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    superAdminId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    impersonatedUserId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'ImpersonationLog',
    tableName: 'ImpersonationLogs',
    timestamps: true,
  });
  return ImpersonationLog;
};
