'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cupom extends Model {
    static associate(models) {
      Cupom.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      Cupom.belongsTo(models.Recompensa, { foreignKey: 'recompensaId', as: 'recompensa' });
      Cupom.belongsTo(models.Client, { foreignKey: 'clienteId', as: 'cliente' });
      Cupom.belongsTo(models.Campanha, { foreignKey: 'campanhaId', as: 'campanha' });
      Cupom.belongsTo(models.Pesquisa, { foreignKey: 'pesquisaId', as: 'pesquisa' });
    }
  }
  Cupom.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pesquisaId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    recompensaId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'recompensas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    clienteId: {
      type: DataTypes.UUID,
      allowNull: true, // Pode ser nulo se o cupom não for para um cliente específico
      references: {
        model: 'clients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    dataGeracao: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dataUtilizacao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dataValidade: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'used', 'expired', 'pending'),
      defaultValue: 'active',
      allowNull: false
    },
    ultimoContato: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Cupom',
    tableName: 'cupons',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return Cupom;
};
