'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SurveyTemplate extends Model {
    static associate(models) {
      // Um template pode pertencer a um tenant (se não for global)
      SurveyTemplate.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    }
  }
  SurveyTemplate.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true, // Pode ser nulo para templates globais do sistema
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    templateData: {
      type: DataTypes.JSONB,
      allowNull: false, // Armazenará a estrutura das perguntas do template
    },
    type: {
      type: DataTypes.STRING, // Ex: 'NPS', 'CSAT', 'RATINGS'
      allowNull: false,
    },
    targetAudience: {
      type: DataTypes.STRING, // Ex: 'Delivery', 'Salão', 'Geral'
      allowNull: true,
    },
    isSystemTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'SurveyTemplate',
    tableName: 'survey_templates',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return SurveyTemplate;
};
