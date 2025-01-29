const CompanyReview = require("../models/CompanyReview");
const User = require("../models/User");
const Hotel = require("../models/Hotel/Hotels");
const logger = require("../config/logger");

const createCompanyReview = async (req, res) => {
  try {
    const { user_id, hotel_id, rating, comment, start_date } = req.body;

    const userExists = await User.findByPk(user_id);
    const hotelExists = await Hotel.findByPk(hotel_id);

    if (!userExists) {
      logger.error(`Користувача з id ${user_id} не знайдено`);
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    if (!hotelExists) {
      logger.error(`Готель з id ${hotel_id} не знайдено`);
      return res.status(404).json({ message: "Готель не знайдено" });
    }

    const newReview = await CompanyReview.create({
      user_id,
      hotel_id,
      rating,
      comment,
      start_date,
    });

    logger.info(
      `Відгук успішно створено для користувача ${user_id} щодо готелю ${hotel_id}`
    );

    return res.status(201).json({
      message: "Відгук успішно створено",
      data: newReview,
    });
  } catch (error) {
    logger.error(`Помилка при створенні відгуку: ${error.message}`);
    return res.status(500).json({
      message: "Внутрішня помилка сервера",
      error: error.message,
    });
  }
};

const getCompanyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;

    const offset = (page - 1) * limit;

    const reviews = await CompanyReview.findAndCountAll({
      where: {},
      limit: parseInt(limit),
      offset: offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "avatar_url"],
        },
        {
          model: Hotel,
          as: "hotel",
          attributes: ["id", "name", "country"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const totalPages = Math.ceil(reviews.count / limit);

    logger.info(`Отримано відгуки для сторінки ${page}`);

    return res.status(200).json({
      message: "Відгуки отримано успішно",
      data: reviews.rows,
      totalPages: totalPages,
      currentPage: parseInt(page),
      totalReviews: reviews.count,
    });
  } catch (error) {
    logger.error(`Помилка при отриманні відгуків: ${error.message}`);
    return res.status(500).json({
      message: "Внутрішня помилка сервера",
      error: error.message,
    });
  }
};

const deleteCompanyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Маємо припустити, що user_id доступний через аутентифікацію (наприклад, в токені)

    // Знаходимо відгук по id
    const review = await CompanyReview.findByPk(id);

    if (!review) {
      logger.error(`Відгук з id ${id} не знайдено`);
      return res.status(404).json({ message: "Відгук не знайдено" });
    }

    // Перевірка чи користувач є автором цього відгуку
    if (review.user_id !== userId) {
      logger.error(
        `Користувач з id ${userId} намагається видалити чужий відгук`
      );
      return res
        .status(403)
        .json({ message: "Ви не маєте прав на видалення цього відгуку" });
    }

    // Видаляємо відгук
    await review.destroy();
    logger.info(`Відгук з id ${id} успішно видалено користувачем ${userId}`);

    return res.status(200).json({
      message: "Відгук успішно видалено",
    });
  } catch (error) {
    logger.error(`Помилка при видаленні відгуку: ${error.message}`);
    return res.status(500).json({
      message: "Внутрішня помилка сервера",
      error: error.message,
    });
  }
};

const getUserReview = async (req, res) => {
  try {
    const { id } = req.params; // Отримуємо id відгуку з параметрів запиту
    const userId = req.user.id; // Маємо припустити, що user_id доступний через аутентифікацію (наприклад, в токені)

    // Знаходимо відгук за id
    const review = await CompanyReview.findByPk(id, {
      include: [
        {
          model: User,
          as: "user", // Вказуємо псевдонім
          attributes: ["id", "first_name", "avatar_url"],
        },
        {
          model: Hotel,
          as: "hotel", // Вказуємо псевдонім
          attributes: ["id", "name", "country"],
        },
      ],
    });

    if (!review) {
      logger.error(`Відгук з id ${id} не знайдено`);
      return res.status(404).json({ message: "Відгук не знайдено" });
    }

    // Перевірка чи користувач є автором цього відгуку
    if (review.user_id !== userId) {
      logger.error(
        `Користувач з id ${userId} намагається отримати чужий відгук`
      );
      return res
        .status(403)
        .json({ message: "Ви не маєте прав на доступ до цього відгуку" });
    }

    logger.info(`Користувач ${userId} отримав відгук з id ${id}`);

    return res.status(200).json({
      message: "Відгук отримано успішно",
      data: review,
    });
  } catch (error) {
    logger.error(`Помилка при отриманні відгуку: ${error.message}`);
    return res.status(500).json({
      message: "Внутрішня помилка сервера",
      error: error.message,
    });
  }
};

const getLatestReviews = async (req, res) => {
  try {
    const reviews = await CompanyReview.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "user", // Вказуємо псевдонім
          attributes: ["id", "first_name", "avatar_url"],
        },
        {
          model: Hotel,
          as: "hotel", // Вказуємо псевдонім
          attributes: ["id", "name", "country"],
        },
      ],
    });

    logger.info("Отримано останні 10 відгуків");

    return res.status(200).json({
      success: true, // Відображає статус виконання
      data: reviews, // Тільки дані, які потрібні
    });
  } catch (error) {
    logger.error(`Помилка при отриманні останніх відгуків: ${error.message}`);
    return res.status(500).json({
      message: "Внутрішня помилка сервера",
      error: error.message,
    });
  }
};

module.exports = {
  createCompanyReview,
  getCompanyReviews,
  deleteCompanyReview,
  getUserReview,
  getLatestReviews,
};
