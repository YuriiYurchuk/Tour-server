const createHotelModel = require("./ModelFactory");

const HotelContact = createHotelModel("HotelContact", "hotel_contacts");

module.exports = HotelContact;
