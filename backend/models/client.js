'use strict';
const {
  Model, Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    static associate(models) {
      Client.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      Client.hasMany(models.Cupom, { foreignKey: 'clienteId', as: 'cupons' }); // Adicionar associação com Cupom
      Client.hasMany(models.Resposta, { foreignKey: 'respondentSessionId', sourceKey: 'respondentSessionId', as: 'respostas' }); // Adicionar associação com Resposta
      Client.hasMany(models.CampanhaLog, { foreignKey: 'clienteId', as: 'campanhaLogs' });

  }
  Client.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    respondentSessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Client',
    tableName: 'clients',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['tenantId', 'email'],
        name: 'unique_tenant_email',
        where: {
          email: {
            [Op.ne]: null,
          },
        },
      },
      {
        unique: true,
        fields: ['tenantId', 'phone'],
        name: 'unique_tenant_phone',
        where: {
          phone: {
            [Op.ne]: null,
          },
        },
      },
    ]
  });
  return Client;
};
