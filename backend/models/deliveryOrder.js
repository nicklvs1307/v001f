'use strict';
const { Model, Op } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeliveryOrder extends Model {
    static associate(models) {
      // Define as associações aqui
      DeliveryOrder.belongsTo(models.Client, { foreignKey: 'clientId', as: 'client' });
      DeliveryOrder.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    }
  }
  DeliveryOrder.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderIdPlatform: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'unique_platform_orderId' // Define um nome para a constraint única composta
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSONB, // JSONB para armazenar o payload completo do webhook
      allowNull: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  }, {
    sequelize,
    modelName: 'DeliveryOrder',
    tableName: 'delivery_orders', // Nome da tabela no banco de dados
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['platform', 'orderIdPlatform'], // Constraint única composta para plataforma e ID do pedido
        name: 'unique_platform_orderId_idx'
      }
    ]
  });
  return DeliveryOrder;
};
