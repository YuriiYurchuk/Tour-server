const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");
const User = require("./User");
const Hotel = require("./Hotel/Hotels");
const HotelRoomType = require("./Hotel/HotelRoomTypes");
const HotelMealType = require("./Hotel/HotelMealTypes");

const Booking = sequelize.define(
  "Booking",
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
      onUpdate: "NO ACTION",
      onDelete: "SET NULL",
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Hotel,
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "SET NULL",
    },
    room_type_id: {
      type: DataTypes.INTEGER,
      references: {
        model: HotelRoomType,
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "SET NULL",
    },
    meal_plan_id: {
      type: DataTypes.INTEGER,
      references: {
        model: HotelMealType,
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "SET NULL",
    },
    price_per_person: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    number_of_tourists: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number_of_children: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    departure_city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    departure_airport: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "очікується",
      validate: {
        isIn: [["очікується", "підтверджено", "скасовано", "завершено"]],
      },
    },
    last_modified: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "booking",
    timestamps: false,
    underscored: true,
    hooks: {
      beforeUpdate: (booking) => {
        booking.last_modified = new Date();
      },
    },
  }
);


module.exports = Booking;
