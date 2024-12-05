const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Hotels = sequelize.define(
  "Hotels",
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
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    star_rating: {
      type: DataTypes.SMALLINT,
      validate: {
        min: 1,
        max: 5,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    hotel_photos: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_hot_deal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tour_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tour_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tour_price: {
      type: DataTypes.NUMERIC,
      allowNull: true,
    },
    average_rating: {
      type: DataTypes.NUMERIC,
      allowNull: true,
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    included_meal_types: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    season: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_orders: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "hotels",
    timestamps: false,
    underscored: true,
  }
);


module.exports = Hotels;
