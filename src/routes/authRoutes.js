const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const authenticateToken = require("../middlewares/authMiddleware.js");
const User = require("../models/User.js");

// Маршрут реєстрації користувача
router.post("/register", authController.register);

// Маршрут логіну користувача
router.post("/login", authController.login);

// Маршрут для оновлення токену доступу
router.post("/refresh-token", authController.refreshToken);

// Маршрут для виходу користувача
router.post("/logout", authController.logout);

// Маршрут для отримання даних профілю користувача (необхідна авторизація)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    // Пошук користувача в базі даних за id яке в казано в access токені
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ["password_hash"] }, // Заборона на повернення паролю
    });

    // Якщо користувача не знайдено повернення помилки
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Повернення даних користувача при знаходженні його в базі даних
    res.json({ message: "Дані профілю", user });
  } catch (error) {
    // Обробка помилок при отримані профілю
    console.error("Помилка отримання профілю:", error);
    res.status(500).json({ message: "Помилка отримання даних профілю" });
  }
});

module.exports = router;
