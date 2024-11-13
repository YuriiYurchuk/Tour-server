const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Booking = require("./Booking");

const BookingContract = sequelize.define(
  "BookingContract",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
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
    middle_name: {
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
      type: DataTypes.STRING(50),
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
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    registration_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "booking_contract",
    timestamps: false,
    underscored: true,
  }
);

module.exports = BookingContract;
