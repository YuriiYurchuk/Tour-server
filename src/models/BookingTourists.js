const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Booking = require("./Booking");

const BookingTourists = sequelize.define(
  "BookingTourists",
  {
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Booking,
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "CASCADE",
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    salutation: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    country_of_birth: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    citizenship: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    document_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    document_series: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    document_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    document_issued_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    document_valid_until: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "booking_tourists",
    timestamps: false,
    underscored: true,
  }
);

module.exports = BookingTourists;
