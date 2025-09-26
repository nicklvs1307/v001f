'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Roleta extends Model {
    static associate(models) {
      Roleta.belongsTo(models.Tenant, {
        foreignKey: 'tenantId',
        as: 'tenant',
      });
      Roleta.hasMany(models.RoletaPremio, {
        foreignKey: 'roletaId',
        as: 'premios',
      });
    }
  }

  Roleta.init({
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
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Roleta',
    tableName: 'roletas',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  return Roleta;
};
