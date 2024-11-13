const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");
const Booking = require("./Booking.js");

const BookingChildren = sequelize.define(
  "BookingChildren",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Booking,
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "CASCADE",
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "booking_children",
    timestamps: false,
    underscored: true,
  }
);

module.exports = BookingChildren;
