'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Um plano pode ter muitos tenants
      // Plan.hasMany(models.Tenant, { foreignKey: 'planId', as: 'tenants' });
    }
  }
  Plan.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    description: DataTypes.TEXT,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Plan',
    tableName: 'plans',
    timestamps: true
  });
  return Plan;
};
