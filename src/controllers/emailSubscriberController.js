const EmailSubscriber = require("../models/EmailSubscriber");
const logger = require("../config/logger");

// Функція додавання нового підписника
const addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;

    // Перевіряємо, чи вже існує підписник із цією електронною адресою
    const existingSubscriber = await EmailSubscriber.findOne({
      where: { email },
    });

    if (existingSubscriber) {
      return res
        .status(409)
        .json({ error: "Ця електронна адреса вже підписана на розсилку." });
    }

    // Додаємо нового підписника
    const newSubscriber = await EmailSubscriber.create({ email });
    logger.info(`Новий підписник доданий: ${email}`);

    res.status(201).json(newSubscriber);
  } catch (error) {
    logger.error(`Помилка при додаванні підписника: ${error.message}`);
    res.status(500).json({ error: "Не вдалося додати підписника." });
  }
};

// Функція отримання всіх підписників
const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await EmailSubscriber.findAll();
    res.status(200).json(subscribers);
  } catch (error) {
    logger.error(`Помилка при отриманні підписників: ${error.message}`);
    res.status(500).json({ error: "Не вдалося отримати підписників." });
  }
};

// Функція видалення підписника за email
const deleteSubscriber = async (req, res) => {
  try {
    const { email } = req.body;

    const deleted = await EmailSubscriber.destroy({ where: { email } });

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Підписника з такою електронною адресою не знайдено." });
    }

    logger.info(`Підписник видалений: ${email}`);
    res.status(200).json({ message: "Підписника успішно видалено." });
  } catch (error) {
    logger.error(`Помилка при видаленні підписника: ${error.message}`);
    res.status(500).json({ error: "Не вдалося видалити підписника." });
  }
};

module.exports = {
  addSubscriber,
  getAllSubscribers,
  deleteSubscriber,
};
