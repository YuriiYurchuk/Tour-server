const createHotelModel = require("./ModelFactory");

const HotelRestaurants = createHotelModel(
  "HotelRestaurants",
  "hotel_restaurants"
);

module.exports = HotelRestaurants;
