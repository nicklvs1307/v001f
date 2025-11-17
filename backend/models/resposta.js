'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Resposta extends Model {
    static associate(models) {
      Resposta.belongsTo(models.Pergunta, { foreignKey: 'perguntaId', as: 'pergunta' });
      Resposta.belongsTo(models.Pesquisa, { foreignKey: 'pesquisaId', as: 'pesquisa' });
      Resposta.belongsTo(models.Atendente, { foreignKey: 'atendenteId', as: 'atendente' });
      Resposta.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
      Resposta.belongsTo(models.Client, { foreignKey: 'respondentSessionId', targetKey: 'respondentSessionId', as: 'client' });

    }
  }
  Resposta.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    perguntaId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    pesquisaId: {
      type: DataTypes.UUID,
      allowNull: false
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
    atendenteId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'atendentes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    respondentSessionId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ratingValue: {
      type: DataTypes.INTEGER
    },
    textValue: {
      type: DataTypes.TEXT
    },
    selectedOption: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Resposta',
    tableName: 'respostas',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return Resposta;
};
