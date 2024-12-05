const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Hotel = require("./Hotels.js");

const HotelRoomTypes = sequelize.define(
  "HotelRoomTypes",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Hotel,
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.NUMERIC,
      allowNull: false,
    },
    photo_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
    },
  },
  {
    tableName: "hotel_room_types",
    timestamps: false,
    underscored: true,
  }
);


module.exports = HotelRoomTypes;
