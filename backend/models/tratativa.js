'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tratativa extends Model {
    static associate(models) {
      Tratativa.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      // We can't easily link to Resposta via respondentSessionId in a standard way with belongsTo 
      // but we can use it in queries.
    }
  }
  Tratativa.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    respondentSessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'),
      defaultValue: 'PENDENTE',
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Tratativa',
    tableName: 'tratativas',
    timestamps: true,
  });
  return Tratativa;
};
