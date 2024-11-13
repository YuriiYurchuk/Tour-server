const createHotelModel = require("./ModelFactory");

const HotelActivity = createHotelModel("HotelActivity", "hotel_activities");

module.exports = HotelActivity;
