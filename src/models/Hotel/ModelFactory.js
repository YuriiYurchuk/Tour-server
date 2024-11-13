const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");
const Hotel = require("./Hotels.js");

function createHotelModel(modelName, tableName) {
  const HotelModel = sequelize.define(
    modelName,
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
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
      description: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
      },
    },
    {
      tableName,
      timestamps: false,
      underscored: true,
    }
  );

  return HotelModel;
}

module.exports = createHotelModel;
