const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");
const Hotel = require("./Hotels.js");

const AverageRating = sequelize.define(
  "AverageRating",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Hotel,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    food_avg: {
      type: DataTypes.NUMERIC,
    },
    room_avg: {
      type: DataTypes.NUMERIC,
    },
    staff_avg: {
      type: DataTypes.NUMERIC,
    },
    price_avg: {
      type: DataTypes.NUMERIC,
    },
    quality_avg: {
      type: DataTypes.NUMERIC,
    },
    beach_avg: {
      type: DataTypes.NUMERIC,
    },
    animation_avg: {
      type: DataTypes.NUMERIC,
    },
  },
  {
    tableName: "average_ratings",
    timestamps: false,
    underscored: true,
  }
);

module.exports = AverageRating;
