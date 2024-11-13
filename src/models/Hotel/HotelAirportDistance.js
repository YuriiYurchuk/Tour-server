const createHotelModel = require("./ModelFactory");

const HotelAirportDistance = createHotelModel(
  "HotelAirportDistance",
  "hotel_airport_distance"
);

module.exports = HotelAirportDistance;