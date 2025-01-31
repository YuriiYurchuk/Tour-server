const User = require("./User");
const Booking = require("./Booking");
const Hotel = require("./Hotel/Hotels");
const HotelRoomType = require("./Hotel/HotelRoomTypes");
const HotelMealType = require("./Hotel/HotelMealTypes");
const BookingChildren = require("./BookingChildren");
const BookingContract = require("./BookingContract");
const BookingServices = require("./BookingServices");
const BookingTourists = require("./BookingTourists");

// Функція для налаштування асоціацій
const setupAssociations = () => {
  // Один User може мати багато Booking
  User.hasMany(Booking, { foreignKey: "user_id" });
  Booking.belongsTo(User, { foreignKey: "user_id" });

  // Один Hotel може мати багато Booking
  Hotel.hasMany(Booking, { foreignKey: "hotel_id" });
  Booking.belongsTo(Hotel, { foreignKey: "hotel_id" });

  // Один HotelRoomType може бути пов'язаний з багатьма Booking
  HotelRoomType.hasMany(Booking, { foreignKey: "room_type_id" });
  Booking.belongsTo(HotelRoomType, { foreignKey: "room_type_id" });

  // Один HotelMealType може бути пов'язаний з багатьма Booking
  HotelMealType.hasMany(Booking, { foreignKey: "meal_plan_id" });
  Booking.belongsTo(HotelMealType, { foreignKey: "meal_plan_id" });

  // Одне Booking може мати багато BookingChildren
  Booking.hasMany(BookingChildren, {
    foreignKey: "booking_id",
    as: "children",
  });
  BookingChildren.belongsTo(Booking, { foreignKey: "booking_id" });

  // Одне Booking може мати один BookingContract
  Booking.hasOne(BookingContract, { foreignKey: "booking_id", as: "contract" });
  BookingContract.belongsTo(Booking, { foreignKey: "booking_id" });

  // Одне Booking може мати багато BookingServices
  Booking.hasMany(BookingServices, {
    foreignKey: "booking_id",
    as: "services",
  });
  BookingServices.belongsTo(Booking, { foreignKey: "booking_id" });

  // Одне Booking може мати багато BookingTourists
  Booking.hasMany(BookingTourists, {
    foreignKey: "booking_id",
    as: "tourists",
  });
  BookingTourists.belongsTo(Booking, { foreignKey: "booking_id" });
};

module.exports = setupAssociations;
