const createHotelModel = require("./ModelFactory");

const HotelCommunication = createHotelModel(
  "HotelCommunication",
  "hotel_communication"
);

module.exports = HotelCommunication;
