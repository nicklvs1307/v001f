'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pesquisa extends Model {
    static associate(models) {
      Pesquisa.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      Pesquisa.belongsTo(models.Usuario, { foreignKey: 'creatorId', as: 'creator' });
      Pesquisa.hasMany(models.Pergunta, { foreignKey: 'pesquisaId', as: 'perguntas' });
      Pesquisa.hasMany(models.Resposta, { foreignKey: 'pesquisaId', as: 'respostas' });
      Pesquisa.belongsTo(models.Recompensa, { foreignKey: 'recompensaId', as: 'recompensa' });
      Pesquisa.belongsTo(models.Roleta, { foreignKey: 'roletaId', as: 'roleta' });
    }
  }
  Pesquisa.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    askForAttendant: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'draft',
    },
    expectedRespondents: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    recompensaId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    roletaId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    roletaPrizeMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isLinkExpirable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    linkExpirationHours: {
      type: DataTypes.INTEGER,
      defaultValue: 24,
      allowNull: false
    },
    linkToken: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    linkExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    operatingHours: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Pesquisa',
    tableName: 'pesquisas',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return Pesquisa;
};