const express = require("express");
const router = express.Router();
const emailSubscriberController = require("../controllers/emailSubscriberController");
const authenticateToken = require("../middlewares/authMiddleware");
const checkManagerRole = require("../middlewares/checkManagerRole");

// Маршрут для додавання нового підписника
router.post("/add", emailSubscriberController.addSubscriber);

// Маршрут для отримання всіх підписників
router.get("/all", authenticateToken, checkManagerRole, emailSubscriberController.getAllSubscribers);

// Маршрут для видалення підписника за email
router.delete("/delete", authenticateToken, checkManagerRole, emailSubscriberController.deleteSubscriber);

module.exports = router;
