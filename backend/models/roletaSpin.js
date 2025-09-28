'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RoletaSpin extends Model {
    static associate(models) {
      RoletaSpin.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      RoletaSpin.belongsTo(models.Roleta, { foreignKey: 'roletaId', as: 'roleta' });
      RoletaSpin.belongsTo(models.Client, { foreignKey: 'clienteId', as: 'cliente' });
      RoletaSpin.belongsTo(models.Campanha, { foreignKey: 'campanhaId', as: 'campanha' });
    }
  }

  RoletaSpin.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      roletaId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      clienteId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      campanhaId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'EXPIRED'),
        defaultValue: 'PENDING',
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'RoletaSpin',
      tableName: 'roleta_spins',
      timestamps: true,
    }
  );

  return RoletaSpin;
};
