const createHotelModel = require("./ModelFactory");

const HotelAmenities = createHotelModel("HotelAmenities", "hotel_amenities");

module.exports = HotelAmenities;
