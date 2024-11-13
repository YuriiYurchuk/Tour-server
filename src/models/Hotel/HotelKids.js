const createHotelModel = require("./ModelFactory");

const HotelKids = createHotelModel("HotelKids", "hotel_kids_amenities");

module.exports = HotelKids;
