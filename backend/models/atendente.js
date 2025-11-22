'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Atendente extends Model {
    static associate(models) {
      Atendente.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      Atendente.hasMany(models.Resposta, { foreignKey: 'atendenteId', as: 'respostas' });
      Atendente.hasOne(models.AtendenteMeta, { foreignKey: 'atendenteId', as: 'meta' });
    }
  }
  Atendente.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Atendente',
    tableName: 'atendentes',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return Atendente;
};
