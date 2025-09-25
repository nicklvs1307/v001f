'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GmbReview extends Model {
    static associate(models) {
      GmbReview.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    }
  }
  GmbReview.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    gmbReviewId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    reviewerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    starRating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    replyComment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    repliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'GmbReview',
    tableName: 'gmb_reviews',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  return GmbReview;
};
