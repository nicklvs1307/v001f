'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AtendentePremiacao extends Model {
    static associate(models) {
      AtendentePremiacao.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      AtendentePremiacao.belongsTo(models.Atendente, { foreignKey: 'atendenteId', as: 'atendente' });
      AtendentePremiacao.belongsTo(models.AtendenteMeta, { foreignKey: 'atendenteMetaId', as: 'meta' });
    }
  }
  AtendentePremiacao.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    atendenteId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    atendenteMetaId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    descricao_premio: {
      type: DataTypes.STRING,
      allowNull: false
    },
    valor_premio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dateAwarded: {
      type: DataTypes.DATE,
      allowNull: false
    },
    metricValueAchieved: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'AtendentePremiacao',
    tableName: 'atendente_premiacoes',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return AtendentePremiacao;
};