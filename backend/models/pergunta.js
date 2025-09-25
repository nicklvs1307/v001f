'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pergunta extends Model {
    static associate(models) {
      Pergunta.belongsTo(models.Pesquisa, { foreignKey: 'pesquisaId', as: 'pesquisa' });
      Pergunta.belongsTo(models.Criterio, { foreignKey: 'criterioId', as: 'criterio' });
      Pergunta.hasMany(models.Resposta, { foreignKey: 'perguntaId', as: 'respostas' });
    }
  }
  Pergunta.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pesquisaId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    criterioId: {
      type: DataTypes.UUID,
      allowNull: true
    },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['rating_1_5', 'rating_0_10', 'free_text', 'multiple_choice', 'checkbox']]
      }
    },
    options: {
      type: DataTypes.JSONB
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Pergunta',
    tableName: 'perguntas',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return Pergunta;
};
