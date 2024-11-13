const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");
const Hotel = require("./Hotels.js");

const HotelLocation = sequelize.define(
  "HotelLocation",
  {
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
    latitude: {
      type: DataTypes.NUMERIC(9, 6),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.NUMERIC(9, 6),
      allowNull: false,
    },
  },
  {
    tableName: "hotel_location",
    timestamps: false,
    underscored: true,
  }
);

module.exports = HotelLocation;
