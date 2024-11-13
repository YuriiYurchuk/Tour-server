const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmailSubscriber = sequelize.define(
  "EmailSubscriber",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "email_subscribers",
    timestamps: false,
    underscored: true,
  }
);

module.exports = EmailSubscriber;
