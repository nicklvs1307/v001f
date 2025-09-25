'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permissao extends Model {
    static associate(models) {
      Permissao.belongsToMany(models.Role, {
        through: models.RolePermissao, // Alterado de 'RolePermissao' (string) para models.RolePermissao (modelo)
        foreignKey: 'permissaoId',
        otherKey: 'roleId',
        as: 'roles'
      });
    }
  }
  Permissao.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Permissao',
    tableName: 'permissoes',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['module', 'action']
      }
    ]
  });
  return Permissao;
};
