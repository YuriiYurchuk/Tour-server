const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");
const Hotel = require("./Hotels.js");
const User = require("../User.js");

const Reviews = sequelize.define(
  "Reviews",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Hotel,
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "CASCADE",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "NO ACTION",
    },
    rating: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    food_rating: {
      type: DataTypes.NUMERIC,
      allowNull: true,
      validate: {
        min: 0,
        max: 10,
      },
    },
    room_rating: {
      type: DataTypes.NUMERIC,
      allowNull: true,
      validate: {
        min: 0,
        max: 10,
      },
    },
    staff_rating: {
      type: DataTypes.NUMERIC,
      allowNull: true,
      validate: {
        min: 0,
        max: 10,
      },
    },
    price_rating: {
      type: DataTypes.NUMERIC,
      allowNull: true,
      validate: {
        min: 0,
        max: 10,
      },
    },
    beach_rating: {
      type: DataTypes.NUMERIC,
      allowNull: true,
      validate: {
        min: 0,
        max: 10,
      },
    },
    animation_rating: {
      type: DataTypes.NUMERIC,
      allowNull: true,
      validate: {
        min: 0,
        max: 10,
      },
    },
  },
  {
    tableName: "reviews",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Reviews;
