const createHotelModel = require("./ModelFactory");

const HotelPools = createHotelModel("HotelPools", "hotel_pools");

module.exports = HotelPools;
