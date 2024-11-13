const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Підключення до вашої бази даних
const Booking = require("./Booking"); // Імпортуємо модель Booking

const BookingServices = sequelize.define(
  "BookingServices",
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
    service_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [["страхування", "трансфер"]],
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    details: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    insurance_period: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "booking_services",
    timestamps: false,
    underscored: true,
  }
);

module.exports = BookingServices;
