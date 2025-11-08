'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CampanhaLog extends Model {
    static associate(models) {
      CampanhaLog.belongsTo(models.Campanha, {
        foreignKey: 'campanhaId',
        as: 'campanha',
      });
      CampanhaLog.belongsTo(models.Client, {
        foreignKey: 'clienteId',
        as: 'client',
      });
    }
  }
  CampanhaLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campanhaId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    clienteId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'failed', 'skipped'),
      allowNull: false,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'CampanhaLog',
    tableName: 'CampanhaLogs',
  });
  return CampanhaLog;
};