const User = require("./User");
const Hotel = require("./Hotel/Hotels");
const CompanyReview = require("./CompanyReview");

const setupAssociations = () => {
  // Асоціації для User
  User.hasMany(CompanyReview, { foreignKey: "user_id", as: "userReviews" });

  // Асоціації для Hotel
  Hotel.hasMany(CompanyReview, { foreignKey: "hotel_id", as: "hotelReviews" });

  // Асоціації для CompanyReview
  CompanyReview.belongsTo(User, { foreignKey: "user_id", as: "user" });
  CompanyReview.belongsTo(Hotel, { foreignKey: "hotel_id", as: "hotel" });
};

module.exports = setupAssociations;
