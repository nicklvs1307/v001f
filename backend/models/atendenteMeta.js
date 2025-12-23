'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AtendenteMeta extends Model {
    static associate(models) {
      AtendenteMeta.belongsTo(models.Atendente, { foreignKey: 'atendenteId', as: 'atendente' });
      AtendenteMeta.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    }
  }
  AtendenteMeta.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    atendenteId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    npsGoal: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    responsesGoal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    registrationsGoal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    period: {
      type: DataTypes.ENUM('DIARIO', 'SEMANAL', 'MENSAL'),
      allowNull: false,
      defaultValue: 'MENSAL'
    },
    dias_trabalhados: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 22
    },
    nps_premio_valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    respostas_premio_valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cadastros_premio_valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'AtendenteMeta',
    tableName: 'atendente_metas',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return AtendenteMeta;
};
