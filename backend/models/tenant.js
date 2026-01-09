'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tenant extends Model {
    static associate(models) {
      Tenant.hasMany(models.Usuario, { foreignKey: 'tenantId', as: 'usuarios' });
      Tenant.hasMany(models.Pesquisa, { foreignKey: 'tenantId', as: 'pesquisas' });
      Tenant.hasOne(models.WhatsappConfig, { foreignKey: 'tenantId', as: 'whatsappConfig' });
      Tenant.hasMany(models.DeliveryOrder, { foreignKey: 'tenantId', as: 'deliveryOrders' }); // Adicionar associação com DeliveryOrder
      Tenant.belongsTo(models.Franchisor, { foreignKey: 'franchisorId', as: 'franchisor' });
    }
  }
  Tenant.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    primaryColor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    secondaryColor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cnpj: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    inscricaoEstadual: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reportPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gmb_link: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uairangoEstablishmentId: { // Novo campo para o ID do estabelecimento no Uai Rango
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    franchisorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'franchisors',
        key: 'id',
      },
    }
  }, {
    sequelize,
    modelName: 'Tenant',
    tableName: 'tenants',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return Tenant;
};
