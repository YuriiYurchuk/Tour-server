const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ContactForm = sequelize.define(
  "ContactForm",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    last_submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "contact_forms",
    timestamps: false,
    underscored: true,
  }
);

module.exports = ContactForm;
