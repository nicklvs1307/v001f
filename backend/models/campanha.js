'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Campanha extends Model {
    static associate(models) {
      Campanha.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      Campanha.belongsTo(models.Recompensa, { foreignKey: 'recompensaId', as: 'recompensa' });
      Campanha.belongsTo(models.Roleta, { foreignKey: 'roletaId', as: 'roleta' });
      Campanha.hasMany(models.Cupom, { foreignKey: 'campanhaId', as: 'cupons' });
      Campanha.hasMany(models.CampanhaLog, { foreignKey: 'campanhaId', as: 'logs' });
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
        allowNull: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mensagens: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      rewardType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'RECOMPENSA',
      },
      recompensaId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      roletaId: {
        type: DataTypes.UUID,
        allowNull: true,
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
        type: DataTypes.ENUM('draft', 'processing', 'sent', 'failed', 'scheduled', 'paused'),
        defaultValue: 'draft',
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      minMessageDelaySeconds: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      maxMessageDelaySeconds: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true,
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
