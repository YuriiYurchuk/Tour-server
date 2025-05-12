const express = require("express");
const router = express.Router();
const hotelReviewsController = require("../controllers/hotel/hotelReviewsController");
const getAllHotelsController = require("../controllers/hotel/getHotelsController");
const getHotelDetails = require("../controllers/hotel/getHotelDetails");
const authenticateToken = require("../middlewares/authMiddleware");

// Додавання відгуку про готель
router.post(
  "/reviews-hotel",
  authenticateToken,
  hotelReviewsController.createReview
);

// Отримання відгуків
router.get("/reviews-hotel", hotelReviewsController.getReviews);

// Отримання всіх готелів з параметрами
router.get("/all", getAllHotelsController.getAllHotels);

// отримання всіх готелів для карти
router.get("/all-map", getAllHotelsController.getAllHotelsWithStreaming);

// Отримання гарячих турів
router.get("/hot", getAllHotelsController.getHotDeals);

// Отримання топ-10 готелів за кількістю замовлень
router.get("/top-orders", getAllHotelsController.getTopHotels);

// Отримання топ-10 готелів за рейтингом
router.get("/top-rated", getAllHotelsController.getTopRatedHotels);

// Отримання топ-10 гарячих готелів
router.get("/top-hot-deals", getAllHotelsController.getTopHotDeals);

// Отримання даних готелю
router.get("/details/:hotelId", getHotelDetails.getHotelByIdWithAssociations);

module.exports = router;
