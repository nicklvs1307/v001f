'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Franchisor extends Model {
    static associate(models) {
      // Uma franqueadora pode ter múltiplos tenants (franqueados)
      Franchisor.hasMany(models.Tenant, { foreignKey: 'franchisorId', as: 'tenants' });
      // Uma franqueadora pode ter múltiplos usuários
      Franchisor.hasMany(models.Usuario, { foreignKey: 'franchisorId', as: 'users' });
    }
  }
  Franchisor.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cnpj: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Franchisor',
    tableName: 'franchisors',
    timestamps: true,
  });
  return Franchisor;
};
