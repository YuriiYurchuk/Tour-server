const express = require("express");
const router = express.Router();
const hotelCreateController = require("../controllers/hotel/hotelCreateController");
const hotelDeleteController = require("../controllers/hotel/hotelDeleteController");
const hotelReviewsController = require("../controllers/hotel/hotelReviewsController");
const getAllHotelsController = require("../controllers/hotel/getHotelsController");
const hotelUpdateController = require("../controllers/hotel/hotelUpdateController");
const getHotelDetails = require("../controllers/hotel/getHotelDetails");
const authenticateToken = require("../middlewares/authMiddleware");
const checkManagerRole = require("../middlewares/checkManagerRole");
const upload = require("../config/multer");

// Створення готелю
router.post(
  "/create",
  upload.fields([
    { name: "gallery", maxCount: 10 },
    { name: "roomType", maxCount: 5 },
  ]),
  authenticateToken,
  checkManagerRole,
  hotelCreateController.createHotel
);

// Оновлення даних готелю
router.put(
  "/update/:hotelId",
  upload.fields([
    { name: "gallery", maxCount: 10 },
    { name: "roomType", maxCount: 5 },
  ]),
  authenticateToken,
  checkManagerRole,
  hotelUpdateController.updateHotel
);

// Видалення готелю
router.delete(
  "/delete/:hotelId",
  authenticateToken,
  checkManagerRole,
  hotelDeleteController.deleteHotel
);

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
