const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking/bookingController");
const getBookingUser = require("../controllers/booking/getBookingUser");
const bookingDataController = require("../controllers/booking/bookingDataController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkManagerRole = require("../middlewares/checkManagerRole");
const checkUserPermissionFor = require("../middlewares/checkUserPermissionFor");

// Створення нового бронювання
router.post("/create", authMiddleware, bookingController.createBooking);

// Отримання бронювання за id користувача
router.get(
  "/get-booking/:user_id",
  authMiddleware,
  getBookingUser.getBookingByUserId
);

router.get(
  "/details-client/:booking_id",
  authMiddleware,
  getBookingUser.getSingleBookingWithConfirmation
);

// Оновлення статусу букінгу
router.patch(
  "/status/:id",
  authMiddleware,
  checkManagerRole,
  bookingController.changeBookingStatus
);

// Скасування букінгу
router.patch(
  "/cancel/:id",
  authMiddleware,
  checkUserPermissionFor,
  bookingController.cancelBooking
);

// Заповнення даних букінгу
router.post(
  "/details/:booking_id",
  authMiddleware,
  bookingDataController.createBookingDetails
);

// Отримання даних букінгу
router.get(
  "/details/:booking_id",
  authMiddleware,
  checkManagerRole,
  bookingDataController.getBookingDetails
);

// Отримання всіх букінгів
router.get(
  "/all",
  authMiddleware,
  checkManagerRole,
  bookingController.getAllBookings
);

module.exports = router;
