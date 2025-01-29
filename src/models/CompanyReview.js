const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");
const User = require("./User");
const Hotel = require("./Hotel/Hotels");

const CompanyReview = sequelize.define(
  "CompanyReview",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "NO ACTION",
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Hotel,
        key: "id",
      },
    },
    rating: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "company_reviews",
    timestamps: false,
    underscored: true,
  }
);

module.exports = CompanyReview;
