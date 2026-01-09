'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.Usuario, { foreignKey: 'roleId', as: 'usuarios' });
      Role.belongsToMany(models.Permissao, {
        through: models.RolePermissao, // Alterado de 'RolePermissao' (string) para models.RolePermissao (modelo)
        foreignKey: 'roleId',
        otherKey: 'permissaoId',
        as: 'permissoes'
      });
    }
  }
  Role.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    isSystemRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return Role;
};
