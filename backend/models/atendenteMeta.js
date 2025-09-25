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
      allowNull: false,
      defaultValue: 0,
    },
    responsesGoal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    registrationsGoal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
