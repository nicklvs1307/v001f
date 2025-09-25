'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Campanha extends Model {
    static associate(models) {
      Campanha.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      Campanha.belongsTo(models.Recompensa, { foreignKey: 'recompensaId', as: 'recompensa' });
      Campanha.hasMany(models.Cupom, { foreignKey: 'campanhaId', as: 'cupons' });
    }
  }

  Campanha.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mensagem: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      recompensaId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      dataValidade: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      criterioSelecao: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Ex: { "type": "all" } ou { "type": "specific", "clientIds": [...] } ou { "type": "birthday", "month": 9 }'
      },
      status: {
        type: DataTypes.ENUM('draft', 'processing', 'sent', 'failed'),
        defaultValue: 'draft',
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Campanha',
      tableName: 'campanhas',
      timestamps: true,
    }
  );

  return Campanha;
};
