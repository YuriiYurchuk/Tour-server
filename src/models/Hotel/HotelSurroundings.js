const createHotelModel = require("./ModelFactory");

const HotelSurroundings = createHotelModel(
  "HotelSurroundings",
  "hotel_surroundings"
);

module.exports = HotelSurroundings;
