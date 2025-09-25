
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Criterio extends Model {
    static associate(models) {
      Criterio.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      Criterio.hasMany(models.Pergunta, { foreignKey: 'criterioId', as: 'perguntas' });
    }
  }
  Criterio.init({
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
    description: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.ENUM('NPS', 'CSAT', 'CES', 'Star', 'Text'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Criterio',
    tableName: 'criterios',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return Criterio;
};
