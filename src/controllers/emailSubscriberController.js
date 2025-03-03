const EmailSubscriber = require("../models/EmailSubscriber");
const User = require("../models/User");
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
        .json({ message: "Ця електронна адреса вже підписана на розсилку." });
    }

    // Додаємо нового підписника
    const newSubscriber = await EmailSubscriber.create({ email });
    logger.info(`Новий підписник доданий: ${email}`);

    return res.status(201).json({
      message: "Електронну адресу успішно додано до розсилки.",
      subscriber: newSubscriber,
    });
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

const subscribeUser = async (req, res) => {
  try {
    const { userId } = req.body; // Параметри для підписки (ID користувача)

    // Перевіряємо, чи існує користувач з таким ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено." });
    }

    // Перевіряємо, чи вже підписаний користувач
    if (user.is_subscribed) {
      return res.status(400).json({ message: "Користувач вже підписаний." });
    }

    // Оновлюємо поле is_subscribed на true
    user.is_subscribed = true;
    await user.save();

    return res
      .status(200)
      .json({ message: "Користувач підписаний на розсилку." });
  } catch (error) {
    logger.error(`Помилка при підписці: ${error.message}`);
    return res.status(500).json({ error: "Не вдалося підписати користувача." });
  }
};

const unsubscribeUser = async (req, res) => {
  try {
    const { userId } = req.body; // Параметри для відписки (ID користувача)

    // Перевіряємо, чи існує користувач з таким ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено." });
    }

    // Перевіряємо, чи вже відписаний користувач
    if (!user.is_subscribed) {
      return res.status(400).json({ message: "Користувач ще не підписаний." });
    }

    // Оновлюємо поле is_subscribed на false
    user.is_subscribed = false;
    await user.save();

    return res
      .status(200)
      .json({ message: "Користувач відписаний від розсилки." });
  } catch (error) {
    logger.error(`Помилка при відписці: ${error.message}`);
    return res.status(500).json({ error: "Не вдалося відписати користувача." });
  }
};

module.exports = {
  addSubscriber,
  getAllSubscribers,
  deleteSubscriber,
  subscribeUser,
  unsubscribeUser,
};
