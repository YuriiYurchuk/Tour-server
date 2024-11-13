const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Booking = require("./Booking");

const BookingFlight = sequelize.define(
  "BookingFlight",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
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
    departure_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    arrival_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    departure_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    arrival_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    departure_location: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    arrival_location: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    airline: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    flight_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    baggage_allowance_kg: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
      allowNull: true,
    },
    carry_on_allowance_kg: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: true,
    },
    price_baggage_allowance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: true,
    },
    price_carry_on_allowance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: true,
    },
    direction: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [["відправлення", "повернення"]],
      },
    },
  },
  {
    tableName: "booking_flight",
    timestamps: false,
    underscored: true,
  }
);

module.exports = BookingFlight;
