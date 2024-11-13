const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");
const Hotel = require("./Hotels.js");

const HotelGallery = sequelize.define(
  "HotelGallery",
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
    photo_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "hotel_gallery",
    timestamps: false,
    underscored: true,
  }
);

module.exports = HotelGallery;
