const Reviews = require("../../models/Hotel/Reviews");
const Hotel = require("../../models/Hotel/Hotels");
const User = require("../../models/User");
const Booking = require("../../models/Booking");
const logger = require("../../config/logger");

// Функція для створення відгуку
const createReview = async (req, res) => {
  try {
    const {
      hotel_id,
      user_id,
      rating,
      comment,
      food_rating,
      room_rating,
      staff_rating,
      price_rating,
      beach_rating,
      animation_rating,
    } = req.body;

    logger.info(
      `Отримано запит на створення відгуку для готелю з id: ${hotel_id}, користувача з id: ${user_id}`
    );

    // Перевірка, чи існує готель
    const hotel = await Hotel.findByPk(hotel_id);
    if (!hotel) {
      logger.warn(`Готель з id ${hotel_id} не знайдено`);
      return res.status(404).json({ error: "Готель не знайдено" });
    }

    // Перевірка, чи існує користувач
    const user = await User.findByPk(user_id);
    if (!user) {
      logger.warn(`Користувача з id ${user_id} не знайдено`);
      return res.status(404).json({ error: "Користувача не знайдено" });
    }

    // Перевірка, чи користувач уже залишав відгук для цього готелю
    const existingReview = await Reviews.findOne({
      where: { hotel_id: hotel_id, user_id: user_id },
    });

    if (existingReview) {
      logger.warn(
        `Користувач з id ${user_id} вже залишав відгук для готелю ${hotel_id}`
      );
      return res.status(403).json({
        error: "Ви вже залишали відгук для цього готелю",
      });
    }

    // Перевірка, чи користувач бронював цей готель
    const booking = await Booking.findOne({
      where: { hotel_id: hotel_id, user_id: user_id },
    });

    if (!booking) {
      logger.warn(
        `Користувач з id ${user_id} не має бронювань у готелі ${hotel_id}`
      );
      return res.status(403).json({
        error: "Ви не можете залишити відгук, оскільки не бронювали цей готель",
      });
    }

    // Створення відгуку в базі даних
    const review = await Reviews.create({
      hotel_id,
      user_id,
      rating,
      comment,
      food_rating,
      room_rating,
      staff_rating,
      price_rating,
      beach_rating,
      animation_rating,
    });

    logger.info(
      `Відгук успішно створено для готелю з id: ${hotel_id}, користувача з id: ${user_id}`
    );

    res.status(201).json({ message: "Відгук успішно створено", review });
  } catch (error) {
    logger.error("Помилка при створенні відгуку: ", error);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
};

const getReviews = async (req, res) => {
  try {
    // Отримання параметрів пагінації з query
    const page = parseInt(req.query.page) || 1; // Якщо не вказано, сторінка за замовчуванням = 1
    const limit = parseInt(req.query.limit) || 9; // Якщо не вказано, ліміт за замовчуванням = 10
    const offset = (page - 1) * limit; // Обчислення offset для пагінації

    logger.info(
      `Отримано запит на отримання відгуків. Сторінка: ${page}, Ліміт: ${limit}`
    );

    const reviews = await Reviews.findAll({
      limit: limit,
      offset: offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "first_name"],
          as: "user",
        },
      ],
    });

    // Якщо відгуків не знайдено
    if (reviews.length === 0) {
      logger.warn("Відгуки не знайдено");
      return res.status(404).json({ message: "Відгуки не знайдено" });
    }

    // Повернення відгуків з пагінацією
    res.status(200).json({
      message: "Відгуки успішно отримано",
      reviews,
      page,
      limit,
    });
  } catch (error) {
    // Логування помилки при отриманні відгуків
    logger.error("Помилка при отриманні відгуків: ", error);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
};

module.exports = {
  createReview,
  getReviews,
};
