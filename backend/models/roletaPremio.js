'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RoletaPremio extends Model {
    static associate(models) {
      RoletaPremio.belongsTo(models.Tenant, {
        foreignKey: 'tenantId',
        as: 'tenant',
      });
      RoletaPremio.belongsTo(models.Recompensa, {
        foreignKey: 'recompensaId',
        as: 'recompensa',
      });
      RoletaPremio.belongsTo(models.Roleta, {
        foreignKey: 'roletaId',
        as: 'roleta',
      });
    }
  }

  RoletaPremio.init({
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
    },
    porcentagem: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    cor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recompensaId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    roletaId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'RoletaPremio',
    tableName: 'roleta_premios',
  });

  return RoletaPremio;
};
