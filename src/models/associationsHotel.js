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
const HotelAirportDistance = require("./Hotel/HotelAirportDistance");
const HotelBeach = require("./Hotel/HotelBeach");
const HotelCommunication = require("./Hotel/HotelCommunication");
const HotelContact = require("./Hotel/HotelContact");
const HotelGeneral = require("./Hotel/HotelGeneral");
const HotelKids = require("./Hotel/HotelKids");
const HotelServices = require("./Hotel/HotelServices");

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

  Hotel.hasMany(HotelAirportDistance, {
    foreignKey: "hotel_id",
    as: "airport",
  });
  HotelAirportDistance.belongsTo(Hotel, { foreignKey: "hotel_id" });

  Hotel.hasMany(HotelBeach, { foreignKey: "hotel_id", as: "beach" });
  HotelBeach.belongsTo(Hotel, { foreignKey: "hotel_id" });

  Hotel.hasMany(HotelCommunication, {
    foreignKey: "hotel_id",
    as: "communication",
  });
  HotelCommunication.belongsTo(Hotel, { foreignKey: "hotel_id" });

  Hotel.hasMany(HotelContact, { foreignKey: "hotel_id", as: "contact" });
  HotelContact.belongsTo(Hotel, { foreignKey: "hotel_id" });

  Hotel.hasMany(HotelGeneral, { foreignKey: "hotel_id", as: "general" });
  HotelGeneral.belongsTo(Hotel, { foreignKey: "hotel_id" });

  Hotel.hasMany(HotelKids, { foreignKey: "hotel_id", as: "kids" });
  HotelKids.belongsTo(Hotel, { foreignKey: "hotel_id" });

  Hotel.hasMany(HotelServices, { foreignKey: "hotel_id", as: "services" });
  HotelServices.belongsTo(Hotel, { foreignKey: "hotel_id" });
}

module.exports = setHotelAssociations;
