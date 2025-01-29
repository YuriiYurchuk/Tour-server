const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");
const Hotel = require("./Hotels.js");

const HotelMealTypes = sequelize.define(
  "HotelMealTypes",
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
    type_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.NUMERIC,
      allowNull: true,
    },
    description: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
  },
  {
    tableName: "hotel_meal_types",
    timestamps: false,
    underscored: true,
  }
);

module.exports = HotelMealTypes;
