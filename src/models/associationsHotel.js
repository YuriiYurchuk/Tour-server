const Hotel = require("./Hotel/Hotels");
const HotelRoomTypes = require("./Hotel/HotelRoomTypes");
const HotelMealTypes = require("./Hotel/HotelMealTypes");
const Reviews = require("./Hotel/Reviews");
const HotelGallery = require("./Hotel/HotelGallery");
const HotelLocation = require("./Hotel/HotelLocation");
const AverageRating = require("./Hotel/AverageRating");
const HotelActivities = require("./Hotel/HotelActivity");
const HotelAmenities = require("./Hotel/HotelAmenities");
const HotelSpas = require("./Hotel/HotelSpas");
const HotelPools = require("./Hotel/HotelPools");
const HotelRestaurants = require("./Hotel/HotelRestaurants");
const HotelSurroundings = require("./Hotel/HotelSurroundings");
const User = require("./User");

function setHotelAssociations() {
  // Готель і відгуки
  Hotel.hasMany(Reviews, { foreignKey: "hotel_id", as: "reviews" });
  Reviews.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і типи кімнат
  Hotel.hasMany(HotelRoomTypes, { foreignKey: "hotel_id", as: "room_types" });
  HotelRoomTypes.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і типи харчування
  Hotel.hasMany(HotelMealTypes, { foreignKey: "hotel_id", as: "meal_types" });
  HotelMealTypes.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і галерея
  Hotel.hasMany(HotelGallery, { foreignKey: "hotel_id", as: "gallery" });
  HotelGallery.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і локація
  Hotel.hasOne(HotelLocation, { foreignKey: "hotel_id", as: "location" });
  HotelLocation.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і середній рейтинг
  Hotel.hasOne(AverageRating, { foreignKey: "hotel_id", as: "rating" });
  AverageRating.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і активності
  Hotel.hasMany(HotelActivities, { foreignKey: "hotel_id", as: "activities" });
  HotelActivities.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і зручності
  Hotel.hasMany(HotelAmenities, { foreignKey: "hotel_id", as: "amenities" });
  HotelAmenities.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і спа
  Hotel.hasMany(HotelSpas, { foreignKey: "hotel_id", as: "spas" });
  HotelSpas.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і басейни
  Hotel.hasMany(HotelPools, { foreignKey: "hotel_id", as: "pools" });
  HotelPools.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і ресторани
  Hotel.hasMany(HotelRestaurants, {
    foreignKey: "hotel_id",
    as: "restaurants",
  });
  HotelRestaurants.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Готель і околиці
  Hotel.hasMany(HotelSurroundings, {
    foreignKey: "hotel_id",
    as: "surroundings",
  });
  HotelSurroundings.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Відгук і користувач
  Reviews.belongsTo(User, { foreignKey: "user_id", as: "user" });
  User.hasMany(Reviews, { foreignKey: "user_id" });
}

module.exports = setHotelAssociations;
