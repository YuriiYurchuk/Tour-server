const createHotelModel = require("./ModelFactory");

const HotelServices = createHotelModel("HotelServices", "hotel_services");

module.exports = HotelServices;
